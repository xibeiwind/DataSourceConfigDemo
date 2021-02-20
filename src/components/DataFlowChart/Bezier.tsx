import * as d3 from "d3";
import React, {Component, MouseEvent} from "react";
import {IBezier, IEndPoint, IPoint} from "../../models/applicationState";
import "./Bezier.scss";
import {EndPoint} from "./EndPoint";
import {pointIncrease} from "./pointAdd";

interface IBezierProps {
  data: IBezier;
  onSelected?: () => void;
  onStartPointChange?: (p: IEndPoint) => void;
  onEndPointChange?: (p: IEndPoint) => void;
}
interface IBezierState {
  pathStr: string;
  active: boolean;
}

export class Bezier extends Component<IBezierProps, IBezierState>{

  state: IBezierState = {
    active: true,
    pathStr: ''
  };

  componentDidMount() {
    this.updatePath();

  }

  componentDidUpdate() {
    this.updatePath();
  }


  render() {
    const {start, end} = this.props.data;
    const {pathStr, active} = this.state;
    return <>
      <path className="u-path" d={pathStr} onClick={this.onPathClick}></path>
      <EndPoint {...start} active={active} onPointChange={this.onStartPointChange} ></EndPoint>
      <EndPoint {...end} active={active} onPointChange={this.onEndPointChange} ></EndPoint>
    </>;
  }

  updatePath() {
    const {start: s, end: e} = this.props.data;
    const path = d3.path();
    path.moveTo(s.point.x, s.point.y);
    const c1 = pointIncrease(s.point, s.control);
    const c2 = pointIncrease(e.point, e.control);
    path.bezierCurveTo(c1.x, c1.y,
      c2.x, c2.y, e.point.x, e.point.y);
    const pathStr = path.toString();
    if (pathStr !== this.state.pathStr) {
      this.setState({pathStr});
    }
  }

  onPathClick = (e: any) => {
    // if(e.target.parentNode?.nodeName==="g"){
    //   d3.selectAll(".active-g")
    //   .classed("active-g", false);
    //   const parentGroup=d3.select(e.target.parentNode);
    //   parentGroup.classed("active-g",true);
    // }
    
    const {onSelected} = this.props;
    if (onSelected) {
      onSelected();
    }
  }

  onStartPointChange = (p: IPoint, c: IPoint) => {
    const {onStartPointChange} = this.props;
    if (onStartPointChange) {
      onStartPointChange({point: p, control: c});
    }

  }
  onEndPointChange = (p: IPoint, c: IPoint) => {
    const {onEndPointChange} = this.props;
    if (onEndPointChange) {
      onEndPointChange({point: p, control: c});
    }
  }
}