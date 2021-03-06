import { css } from '@patternfly/react-styles';
import { getQuery, OcpQuery } from 'api/ocpQuery';
import { OcpReport, OcpReportType } from 'api/ocpReports';
import {
  OcpReportSummaryItem,
  OcpReportSummaryItems,
} from 'components/reports/ocpReportSummary';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { createMapStateToProps, FetchStatus } from 'store/common';
import { ocpReportsActions, ocpReportsSelectors } from 'store/ocpReports';
import { formatValue } from 'utils/formatValue';
import { ComputedOcpReportItem } from 'utils/getComputedOcpReportItems';
import { styles } from './detailsSummary.styles';

interface DetailsSummaryOwnProps {
  groupBy: string;
  item: ComputedOcpReportItem;
}

interface DetailsSummaryStateProps {
  queryString?: string;
  report?: OcpReport;
  reportFetchStatus?: FetchStatus;
}

interface DetailsSummaryDispatchProps {
  fetchReport?: typeof ocpReportsActions.fetchReport;
}

type DetailsSummaryProps = DetailsSummaryOwnProps &
  DetailsSummaryStateProps &
  DetailsSummaryDispatchProps &
  InjectedTranslateProps;

const reportType = OcpReportType.cost;

class DetailsSummaryBase extends React.Component<DetailsSummaryProps> {
  public componentDidMount() {
    const { fetchReport, queryString } = this.props;
    fetchReport(reportType, queryString);
  }

  public componentDidUpdate(prevProps: DetailsSummaryProps) {
    const { fetchReport, queryString } = this.props;
    if (prevProps.queryString !== queryString) {
      fetchReport(reportType, queryString);
    }
  }

  public render() {
    const { report, t } = this.props;

    return (
      <div>
        {t('ocp_details.historical.project_title')}
        <div className={css(styles.projectsProgressBar)}>
          <OcpReportSummaryItems idKey="project" report={report}>
            {({ items }) =>
              items.map(reportItem => (
                <OcpReportSummaryItem
                  key={reportItem.id}
                  formatOptions={{}}
                  formatValue={formatValue}
                  label={reportItem.label.toString()}
                  totalValue={report.meta.total.cost.value}
                  units={reportItem.units}
                  value={reportItem.cost}
                />
              ))
            }
          </OcpReportSummaryItems>
        </div>
      </div>
    );
  }
}

const mapStateToProps = createMapStateToProps<
  DetailsSummaryOwnProps,
  DetailsSummaryStateProps
>((state, { groupBy, item }) => {
  const query: OcpQuery = {
    filter: {
      time_scope_units: 'month',
      time_scope_value: -1,
      resolution: 'monthly',
      limit: 5,
    },
    group_by: {
      project: '*',
      [groupBy]: item.label || item.id,
    },
  };
  const queryString = getQuery(query);
  const report = ocpReportsSelectors.selectReport(
    state,
    reportType,
    queryString
  );
  const reportFetchStatus = ocpReportsSelectors.selectReportFetchStatus(
    state,
    reportType,
    queryString
  );
  return {
    report,
    reportFetchStatus,
    queryString,
  };
});

const mapDispatchToProps: DetailsSummaryDispatchProps = {
  fetchReport: ocpReportsActions.fetchReport,
};

const DetailsSummary = translate()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DetailsSummaryBase)
);

export { DetailsSummary, DetailsSummaryProps };
