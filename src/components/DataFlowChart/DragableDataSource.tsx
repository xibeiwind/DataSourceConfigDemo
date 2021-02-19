import React, {Component, createRef, RefObject} from "react";
import {IBezier, IDataField, IDataSource, IPoint} from "../../models/applicationState";
import {constants} from "../constants";
import {FieldControlPoint} from "./FieldControlPoint";
import * as d3 from "d3";
import {Bezier} from "./Bezier";
import {pointIncrease} from "./pointAdd";
const {dataSource: settings} = constants;

interface IDragableDataSourceProps {
  source: IDataSource;
  onDrag(p: IPoint): void;
  onControlPointDragEnd: (p: IPoint, sourceId: string, fieldId:string, fromSource:boolean, bezierData: IBezier ) => void;
  onActiveControlChanged?: (id:string)=> void;
}
interface IDragableDataSourceState {
  active?: boolean;
  drawBezier: boolean;
  fromSource?: boolean;
  bezierData?: IBezier;
}

export class DragableDataSource extends Component<IDragableDataSourceProps, IDragableDataSourceState> {
  state: IDragableDataSourceState = {
    drawBezier: false,
  };
  rectRef: RefObject<SVGRectElement> = createRef();
  bezierGroupRef: RefObject<SVGGElement> = createRef();


  componentDidMount() {
    const {onDrag} = this.props;
    const rect = d3.select(this.rectRef.current);
    let p: IPoint = {x: 0, y: 0};
    rect.call(d3.drag()
      .on("start", function (e: DragEvent) {
        d3.select(this).attr("stroke", "black");
        p = {x: e.x, y: e.y};
      })
      .on("drag", function (e: DragEvent) {
        onDrag({x: e.x - p.x, y: e.y - p.y});
      })
      .on("end", function (e: DragEvent) {
        d3.select(this).attr("stroke", null);
      }));
  }

  render() {
    const {fields, offset} = this.props.source;
    const {drawBezier, bezierData} = this.state;
    return <>
    {drawBezier && <g ref={this.bezierGroupRef}> <Bezier data={bezierData}></Bezier></g>}
      <g className="data-source"
        transform={`translate(${offset?.x ?? 0},${offset?.y ?? 0})`}
      >
        <rect
          className="border"
          width={this.getRectWidth()}
          height={this.getRectHeight()}
        >
        </rect>

        {this.rendTitle()}
        {this.rendFields(fields)}
      </g>
      
    </>;
  }

  getRectWidth = (): number => {
    return settings.width;
  }
  getRectHeight = () => {

    return settings.field.height * (this.props.source.fields.length + 1);
  }
  rendTitle = () => {
    const {title, name} = this.props.source;
    const {width: w} = settings;
    const {height: h} = settings.field;
    return <>
      <rect
        ref={this.rectRef}
        className="title-rect"
        width={w}
        height={h}>

      </rect>
      <text
        y={h / 2}
        className="title">
        {title ?? name}
      </text></>;
  }
  rendFields = (fields: IDataField[]) => {
    const {height: h} = settings.field;
    return <g transform={`translate(0, ${settings.field.height})`}>
      {
        fields.map((f, i) => <g
          className="field"
          key={i}
          transform={`translate(0, ${h * i})`}>
          {this.rendField(f, i)}</g>)
      }
    </g>
  }
  rendField = (field: IDataField, i: number) => {
    // get offset
    const {width: w} = settings;
    const {height: h} = settings.field;
    const {size} = settings.field.controlPoint;

    return <>
      <line className="field-line" x1="0" y1="0" x2={w} y2="0"></line>
      <text className="field-title"
        y={h / 2}
        x={10}
      >
        {field.title ?? field.name}
      </text>
      <g transform={`translate(-${size.w / 2}, ${(h - size.h) / 2})`}>
        <FieldControlPoint fieldId={field.id}
          isSource={false}
          onDragStart={p => this.onControlPointDragStart(p, field.id, false)}
          onDrag={p => this.onControlPointDrag(p, field.id)}
          onDragEnd={p => this.onControlPointDragEnd(p, field.id)}
        ></FieldControlPoint>
      </g>
      <g transform={`translate(${w - size.w / 2}, ${(h - size.h) / 2})`}>
        <FieldControlPoint fieldId={field.id}
          isSource={true}
          onDragStart={p => this.onControlPointDragStart(p, field.id, true)}
          onDrag={p => this.onControlPointDrag(p, field.id)}
          onDragEnd={p => this.onControlPointDragEnd(p, field.id)}
        ></FieldControlPoint>
      </g>
    </>
  }

  onControlPointDragStart = (point: IPoint, fieldId: string, fromSource: boolean) => {
    const g = d3.select(this.bezierGroupRef.current);
    g.lower();

    const offset = this.getControlPointOffset(fieldId, fromSource);

    const bezierData: IBezier = {
      start: {point: offset, control: {x: 10, y: 0}},
      end: {point: offset, control: {x: -10, y: 0}},
    };

    this.setState({
      drawBezier: true,
      fromSource,
      bezierData
    },()=>{
      if(this.props.onActiveControlChanged){
        this.props.onActiveControlChanged(this.props.source.id);
      }
    });
  }
  onControlPointDrag = (point: IPoint, fieldId: string) => {
    
    const {fromSource, bezierData} = this.state;
    const offset = this.getControlPointOffset(fieldId, fromSource);
    if (fromSource) {
      bezierData.end.point = pointIncrease(offset, point);
    }
    else {
      bezierData.start.point = pointIncrease(offset, point);
    }
    this.setState({bezierData});

  }
  onControlPointDragEnd = (point: IPoint, fieldId: string) => {
    const {onControlPointDragEnd, source} = this.props;
    const {fromSource, bezierData} = this.state;
    const offset = this.getControlPointOffset(fieldId, fromSource);
     this.setState({drawBezier: false}, () => {
      if (onControlPointDragEnd) {
        onControlPointDragEnd(pointIncrease(offset, point),source.id,fieldId,fromSource,{...bezierData});
      }
    });
    
  }

  getControlPointOffset = (fieldId: string, fromSource: boolean): IPoint => {
    const {fields, offset} = this.props.source;
    const {width: w} = settings;
    const {height: h, controlPoint: size} = settings.field;
    const field = fields.find(a => a.id == fieldId);
    const index = fields.indexOf(field);
    const x = offset.x + (fromSource ? w : 0);
    const y = offset.y + (index + 1.5) * h;
    return {x, y};
  }
}

