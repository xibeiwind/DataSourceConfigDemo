import * as d3 from "d3";
import React, {Component, createRef, RefObject} from "react";
import {IPoint} from "../../models/applicationState";
import {getPointConfig} from "../constants";

interface IPointProps extends IPoint {
  active: boolean;
  onPointChange(point: IPoint): void;
}
interface IPointState {

}

export class Point extends Component<IPointProps, IPointState>{
  state: IPointState = {};
  circleRef: RefObject<SVGCircleElement> = createRef();
  componentDidMount() {
    const {onPointChange} = this.props;
    const circle = d3.select(this.circleRef.current);
    circle.attr('draggable', true);
    circle.call(d3.drag()
      .on("start", function (e: DragEvent) {
        d3.select(this).attr("stroke", "black");
      })
      .on("drag", function (e: DragEvent) {
        onPointChange({x: e.x, y: e.y});
      })
      .on("end", function (e: DragEvent) {
        d3.select(this).attr("stroke", null);
      }));
  }
  render() {
    const {x, y, active} = this.props;
    const cfg = getPointConfig(active);
    return <>
      <circle
        className="u-circle"
        ref={this.circleRef}
        tabIndex={1}
        cx={x}
        cy={y}
        r={cfg.r}
      ></circle>
    </>;
  }
}