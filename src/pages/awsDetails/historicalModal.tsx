import { Modal } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import { AwsQuery, getQuery } from 'api/awsQuery';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { awsDashboardSelectors } from 'store/awsDashboard';
import { createMapStateToProps } from 'store/common';
import { ComputedAwsReportItem } from 'utils/getComputedAwsReportItems';
import { HistoricalChart } from './historicalChart';
import { modalOverride, styles } from './historicalModal.styles';

interface HistoricalModalOwnProps {
  groupBy: string;
  isOpen: boolean;
  item: ComputedAwsReportItem;
  onClose(isOpen: boolean);
}

interface HistoricalModalStateProps {
  currentQueryString: string;
  previousQueryString: string;
  widgets: number[];
}

type HistoricalModalProps = HistoricalModalOwnProps &
  HistoricalModalStateProps &
  InjectedTranslateProps;

class HistoricalModalBase extends React.Component<HistoricalModalProps> {
  constructor(props: HistoricalModalProps) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
  }

  public componentDidMount() {
    this.setState({});
  }

  public shouldComponentUpdate(nextProps: HistoricalModalProps) {
    const { isOpen, item } = this.props;
    return nextProps.item !== item || nextProps.isOpen !== isOpen;
  }

  private handleClose = () => {
    this.props.onClose(false);
  };

  public render() {
    const {
      currentQueryString,
      groupBy,
      isOpen,
      item,
      previousQueryString,
      t,
    } = this.props;

    return (
      <Modal
        className={`${modalOverride} ${css(styles.modal)}`}
        isLarge
        isOpen={isOpen}
        onClose={this.handleClose}
        title={t('aws_details.historical.modal_title', {
          groupBy,
          name: item.label,
        })}
      >
        <HistoricalChart
          currentQueryString={currentQueryString}
          groupBy={groupBy}
          previousQueryString={previousQueryString}
        />
      </Modal>
    );
  }
}

const mapStateToProps = createMapStateToProps<
  HistoricalModalOwnProps,
  HistoricalModalStateProps
>((state, { groupBy, item }) => {
  const currentQuery: AwsQuery = {
    filter: {
      time_scope_units: 'month',
      time_scope_value: -1,
      resolution: 'daily',
      limit: 5,
    },
    group_by: {
      [groupBy]: item.label || item.id,
    },
  };
  const currentQueryString = getQuery(currentQuery);
  const previousQuery: AwsQuery = {
    filter: {
      time_scope_units: 'month',
      time_scope_value: -2,
      resolution: 'daily',
      limit: 5,
    },
    group_by: {
      [groupBy]: item.label || item.id,
    },
  };
  const previousQueryString = getQuery(previousQuery);
  return {
    currentQueryString,
    previousQueryString,
    widgets: awsDashboardSelectors.selectCurrentWidgets(state),
  };
});

const HistoricalModal = translate()(
  connect(
    mapStateToProps,
    {}
  )(HistoricalModalBase)
);

export { HistoricalModal };
