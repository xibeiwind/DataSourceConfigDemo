import * as d3 from "d3";
import React, {createRef, RefObject} from 'react';
import {IPoint} from '../../models/applicationState';
import {constants} from "../constants";

const {size} = constants.dataSource.field.controlPoint;

interface IFieldControlPointProps {
  fieldId: string;
  isSource: boolean;
  onDragStart(p: IPoint): void;
  onDrag(p: IPoint): void;
  onDragEnd(p: IPoint): void;
}
interface IFieldControlPointState {

}
export class FieldControlPoint extends React.Component<IFieldControlPointProps, IFieldControlPointState>{
  state: IFieldControlPointState = {};
  rectRef: RefObject<SVGRectElement> = createRef();

  componentDidMount() {
    const {onDragStart, onDragEnd, onDrag, fieldId} = this.props;
    const rect = d3.select(this.rectRef.current);
    let p: IPoint = {x: 0, y: 0};
    rect.call(d3.drag()
      .on("start", function (e: DragEvent) {
        rect.classed("field-control-point-drag", true);
        d3.select(this).attr("stroke", "black");
        p = {x: e.x, y: e.y};
        onDragStart(p);
      })
      .on("drag", function (e: DragEvent) {
        onDrag({x: e.x - size.w / 2, y: e.y - size.h / 2});
      })
      .on("end", function (e: any) {

        rect.classed("field-control-point-drag", false);
        d3.select(this).attr("stroke", null);
        onDragEnd({x: e.x-p.x/2, y: e.y-p.y/2});
      }));

  }

  render() {
    return (
      <>
        <rect
          ref={this.rectRef}
          width={size.w}
          height={size.h}
          onDrop={this.onRectDrop}

          className="field-control-point"></rect>
      </>
    )
  }
  onRectDrop = (e) => {
    console.log(e);
  }
}