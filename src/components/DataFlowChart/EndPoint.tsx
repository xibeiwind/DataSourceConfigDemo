import React, {Component} from "react";
import {IPoint} from "../../models/applicationState";
import {ControlPoint} from "./ControlPoint";
import {Point} from "./Point";

export interface IEndPointProps {
  point: IPoint;
  control: IPoint;
  active: boolean;
  onPointChange(p: IPoint, c: IPoint): void;
}
interface IEndPointState {

}

export class EndPoint extends Component<IEndPointProps, IEndPointState>{
  state: IEndPointState = {};

  componentDidUpdate(prevProps: IEndPointProps) {
  }

  render() {
    const {point, control, active, onPointChange} = this.props;
    if (!(point && control)) {
      return <></>;
    }
    return <>
      <Point
        onPointChange={this.onPointChange}
        x={point.x}
        y={point.y}
        active={active} />
      <ControlPoint
        onPointChange={this.onControlPointChange}
        base={point}
        control={control}
        active={active} />
    </>

      ;
  }

  onPointChange = (p: IPoint) => {
    const {control, onPointChange} = this.props;
    if (onPointChange) {
      onPointChange(p, control);
    }
  }

  onControlPointChange = (p: IPoint) => {
    const {point, onPointChange} = this.props;
    if (onPointChange) {

      onPointChange(point, {x: p.x - point.x, y: p.y - point.y});
    }
  }
}