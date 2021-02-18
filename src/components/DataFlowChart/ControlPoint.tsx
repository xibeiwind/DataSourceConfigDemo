import * as d3 from "d3";
import React, {Component, createRef, RefObject} from "react";
import {IPoint} from '../../models/applicationState';
import {getPointConfig} from "../constants";
import {Point} from "./Point";
import {pointIncrease} from "./pointAdd";
interface IControlPointProps {
  base: IPoint;
  control: IPoint;
  active: boolean;
  onPointChange(point: IPoint): void;
}
interface IControlPointState {

}

export class ControlPoint extends Component<IControlPointProps, IControlPointState>{
  state: IControlPointState = {};
  // componentDidMount() {
  //   const {onPointChange} = this.props;
  //   const props = this.props;
  //   const circle = d3.select(this.circleRef.current);
  //   circle.call(d3.drag()
  //     .on("start", function (e: DragEvent) {
  //       d3.select(this).attr("stroke", "black");
  //     })
  //     .on("drag", function (e: DragEvent) {
  //       onPointChange({x: e.x, y: e.y});
  //     })
  //     .on("end", function (e: DragEvent) {
  //       d3.select(this).attr("stroke", null);
  //     }));
  // }

  render() {
    const {base, control, active, onPointChange} = this.props;
    const c = pointIncrease(base, control);
    const cfg = getPointConfig(active);

    return <>
      <Point
        x={c.x}
        y={c.y}
        active={active}
        onPointChange={onPointChange} />
      { active &&
        <line
          className="u-line"
          x1={base.x}
          y1={base.y}
          x2={c.x}
          y2={c.y}
        />}
    </>;
  }
}


