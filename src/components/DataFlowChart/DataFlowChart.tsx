import React from 'react';
import {IDataFlowChart, IDataSource, IPoint, IRect} from '../../models/applicationState';
import {DragableDataSource} from './DragableDataSource';
import "./DataFlowChart.scss";
import {pointIncrease} from './pointAdd';
import {constants} from "../constants";
const {size} = constants.dataSource.field.controlPoint;
interface IDataFlowChartProps {
  data: IDataFlowChart;
  onDataSourceChange(data: IDataSource): void;
}
interface IDataFlowChartState {
  points: IControlPoint[];
}
export class DataFlowChart extends React.Component<IDataFlowChartProps, IDataFlowChartState>{
  state: IDataFlowChartState = {points: []};
  componentDidMount() {
    const {data} = this.props;
    const points = data.sources.flatMap(getDataSourceControlPoints);
    this.setState({points});
  }
  componentDidUpdate(prevProps: IDataFlowChartProps) {
    // const {data} = this.props;
    // const points = data.sources.flatMap(getDataSourceControlPoints);
    // this.setState({points});
  }
  render() {
    const {sources, connections} = this.props.data;
    return (
      <>
        <svg className="data-flow-chart">
          {sources.map((s, i) => <DragableDataSource
            source={s} key={i}
            onDrag={(p: IPoint) => {
              s.offset = pointIncrease(s.offset ?? {x: 0, y: 0}, p);
              this.props.onDataSourceChange(s);
            }}
            onControlPointDrag={this.onControlPointDrag}
          />
          )}
        </svg>
      </>
    )
  }

  onControlPointDrag = (p: IPoint) => {
    const {points} = this.state;
    const point = points.find(item => contains({
      x: item.center.x - size.w / 2, y: item.center.y - size.h / 2,
      w: size.w, h: size.h
    }, p));
    if (point) {
      console.log(point);
    }
  }
}

interface IControlPoint {
  fieldId: string;
  fromSource: boolean;
  center: IPoint;
}

function getDataSourceControlPoints(data: IDataSource): IControlPoint[] {
  const {width: w, field} = constants.dataSource;
  const {height: h} = field;
  const {offset} = data;

  return data.fields.flatMap<IControlPoint>((f, i) => [
    {
      fieldId: f.id,
      fromSource: true,
      center: pointIncrease({x: w, y: (1.5 + i) * h}, offset),
    },
    {
      fieldId: f.id,
      fromSource: false,
      center: pointIncrease({x: 0, y: (1.5 + i) * h}, offset),
    }]);
}

function contains(rect: IRect, point: IPoint) {
  const result = (
    Math.abs(point.x-rect.x)<rect.w&&Math.abs(point.y-rect.y)<rect.h
  );
  if (result) {
    console.log(result);
  }
  return result;
}