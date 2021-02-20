import React from 'react';
import {IBezier, IDataFlowChart, IDataSource, IEndPoint, IFieldConnection, IPoint, IRect} from '../../models/applicationState';
import {DragableDataSource} from './DragableDataSource';
import "./DataFlowChart.scss";
import {pointIncrease} from './pointAdd';
import {constants} from "../constants";
import { v4 as uuid } from 'uuid';
import {Bezier} from './Bezier';
import {KeyboardBinding} from '../keyboardBinding';
import {KeyEventType} from '../keyboardManager';
import * as d3 from "d3";
import _ from 'lodash';
const {dataSource: settings} = constants;
const {size} = constants.dataSource.field.controlPoint;
interface IDataFlowChartProps {
  data: IDataFlowChart;
  onDataSourceChange(data: IDataSource): void;
  onDataChange(data: IDataFlowChart): void;
  onDataConnectionChange(data: IFieldConnection[]): void;
}
interface IDataFlowChartState {
  points: IControlPoint[];
}
interface IElePosition{
  id: string;
  isSource: boolean;
  start: IPoint;
  end: IPoint;
}
export class DataFlowChart extends React.Component<IDataFlowChartProps, IDataFlowChartState>{
  state: IDataFlowChartState = {points: []};
  activeSourceId: string;
  isMouseDown: boolean;
  startPoint: IPoint;
  componentDidMount() {
    // const {data} = this.props;
    // const points = data.sources.flatMap(getDataSourceControlPoints);
    // this.setState({points});
  }
  componentDidUpdate(prevProps: IDataFlowChartProps) {
  }
  updatePoints=()=>{
    const {data} = this.props;
    const points = data.sources.filter(s=>s.id!==this.activeSourceId).flatMap(this.getDataSourceControlPoints);
    this.setState({points});
  }
  render() {
    const {sources, connections} = this.props.data;
    const that=this;
    return (
      <>
     
      <KeyboardBinding
                    displayName={"Delete region"}
                    key={"Delete"}
                    keyEventType={KeyEventType.KeyUp}
                    accelerators={["Delete"]}
                    handler={this.handleDeleteKeyPress}
                />
        <svg className="data-flow-chart"
          onMouseDown={function(e){that.onMouseDown(this,e)}}
          onMouseMove={function(e){that.onMouseMove(this,e)}}
          onMouseUp={function(e){that.onMouseUp(this,e)}}
        >
          {sources.map((s, i) => <DragableDataSource
            source={s} key={i}
            onDrag={(p: IPoint) => {
              s.offset = pointIncrease(s.offset ?? {x: 0, y: 0}, p);
              this.props.onDataSourceChange(s);
            }}
            onControlPointDragEnd={this.onControlPointDragEnd}
            onActiveControlChanged={this.onActiveControlChanged}
            onSelected={()=>{this.onDataSourceSelected(s.id)}}
          />
          )}
          {
            connections.map((c) =>
              <g className={c.active?"active-g bezier-g":"bezier-g"}>
              <Bezier
                data={
                  {
                    start: {
                      point: this.getPoint(c.source.sourceId, c.source.fieldId, true),
                      control: c.source.control
                    },
                    end: {
                      point: this.getPoint(c.target.sourceId, c.target.fieldId, false),
                      control: c.target.control
                    }
                  }}
                  onStartPointChange={(p: IEndPoint)=>{this.onPointChange(c.id,p.control,true)}}
                  onEndPointChange={(p: IEndPoint)=>{this.onPointChange(c.id,p.control,false)}}
                  onSelected={()=>{this.onBezierSelected(c.id)}}
              />
              </g>
            )
          }
        </svg>
      </>
    )
  }
  onBezierSelected = (id: string) => {
    const {data, onDataChange} = this.props;
    if (onDataChange) {
      data.connections.filter(c => c.active === true).forEach(c => {
        c.active = false;
      })
      data.connections.find(c => c.id === id).active = true;
      data.sources.filter(s => s.active === true).forEach(s => s.active = false);
      onDataChange(data);
    }
  }

  onDataSourceSelected = (id: string) => {
    const {data, onDataChange} = this.props;
    if (onDataChange) {
      data.sources.filter(s => s.active === true).forEach(s => {
        s.active = false;
      });
      data.sources.find(s => s.id === id).active = true;
      data.connections.filter(c => c.active === true).forEach(c => c.active = false);
      onDataChange(data);
    }
  }

  onMouseDown=(self: any,event:any)=>{
    if(!this.isMouseDown){
      const ele=d3.select(event.target);
      const [x, y] = d3.pointer(event, self);
      this.startPoint={x,y};
      ele.append("rect")
      .attr("x", this.startPoint.x)
      .attr("y", this.startPoint.y)
      .attr("width", 0)
      .attr("height", 0)
      .classed("selection-rect",true);
      this.isMouseDown=true;
    }
    event.stopPropagation();
  }
  onMouseMove=(self: any,event:any)=>{
    if(this.isMouseDown){
      const [x, y] = d3.pointer(event, self);
      const ele=d3.select(event.target);
      ele.select(".selection-rect")
      .attr("width",Math.abs(this.startPoint.x-x))
      .attr("height",Math.abs(this.startPoint.y-y));
    }
    event.stopPropagation();
  }
  onMouseUp=(self: any,event:any)=>{
    if(this.isMouseDown){
     d3.selectAll(".selection-rect").remove();
     const {onDataChange} =this.props;
      if (onDataChange) {
        const [x, y] = d3.pointer(event, self);
        const positions = this.getElePositions();
        const matchedPositions = positions.filter(
          p => p.start.x >= this.startPoint.x
            && p.start.y >= this.startPoint.y
            && p.end.x <= x
            && p.end.y <= y
        )
        const {data} = this.props;
        data.sources.filter(s => s.active === true).forEach(s => s.active = false);
        data.connections.filter(c => c.active === true).forEach(c => c.active = false);
        if (matchedPositions.length > 0) {
          const sourceIds = matchedPositions.filter(p => p.isSource === true).map(p => p.id);
          if (sourceIds.length > 0) {
            data.sources.filter(s => sourceIds.indexOf(s.id) >= 0).forEach(s => s.active = true);
          }
          const connIds = matchedPositions.filter(p => p.isSource === false).map(p => p.id);
          if (connIds.length > 0) {
            data.connections.filter(c => connIds.indexOf(c.id) >= 0).forEach(c => c.active = true);
          }
        }
        onDataChange(data);
      }
     
      this.startPoint=undefined;
      this.isMouseDown=false;
    }
    event.stopPropagation();
  }
  handleDeleteKeyPress = (keyEvent) => {
    const {onDataChange, data} =this.props;
    if (onDataChange) {
      _.remove(data.sources,function(s: IDataSource){
        return s.active===true
      })
      _.remove(data.connections,function(c: IFieldConnection){
        return c.active===true
      })
      onDataChange(data);
    }
    d3.selectAll(".active-g").each(function(p,j){
     const n= d3.select(this).node();
    })
  }

  onPointChange=(id:string,point:IPoint,isSource:boolean)=>{
    const {data, onDataConnectionChange} =this.props;
    const conn=data.connections.find(c=>c.id===id);
    if(conn){
      if(isSource){
        conn.source.control=point;
      }
      else{
        conn.target.control=point;
      }
      if(onDataConnectionChange){
        onDataConnectionChange(data.connections);
      }
    }
  }

  getPoint=(sourceId:string, fieldId: string, fromSource: boolean)=>{
    let p: IPoint={x:0,y:0};
    const {sources} = this.props.data;
    const source=sources.find(s=>s.id===sourceId);
    if(source){
      const {fields, offset} = source;
      const {width: w} = settings;
      const {height: h, controlPoint: size} = settings.field;
      const field = fields.find(a => a.id == fieldId);
      const index = fields.indexOf(field);
      const x = offset.x + (fromSource ? w : 0);
      const y = offset.y + (index + 1.5) * h;
      p={x,y};
    }
    
    return p;
  }
 
  getElePositions=()=>{
    const {data} =this.props;
    const {width: w} = settings;
    const {height: h} = settings.field;
    
    const positions:IElePosition[]=[];
    data.sources.forEach(s=>{
      const rectHeight= settings.field.height * (s.fields.length + 1);
      positions.push({
        id: s.id,
        isSource: true,
        start: s.offset,
        end: {x: s.offset.x+w, y:rectHeight}
      })
    });
    data.connections.forEach(c=>{
      const start= this.getPoint(c.source.sourceId, c.source.fieldId, true);
      const end= this.getPoint(c.target.sourceId, c.target.fieldId, false);
      positions.push({
        id: c.id,
        isSource: false,
        start,
        end
      })
    })
    return positions;
  }

  onActiveControlChanged=(id:string)=>{
    this.activeSourceId=id;
    this.updatePoints();
  }

  onControlPointDragEnd = (p: IPoint, sourceId: string, fieldId:string, fromSource:boolean, bezierData: IBezier ) => {
    const {points} = this.state;
    const {onDataConnectionChange, data} =this.props;
    const point = points.filter(item=> item.fromSource!==fromSource).find(item => contains({
      x: item.center.x - size.w / 2, y: item.center.y - size.h / 2,
      w: size.w, h: size.h
    }, p));
    if (point) {
      let newConnection: IFieldConnection=undefined;
      if(fromSource){
        newConnection={
        id: uuid(),
        source:{
          sourceId,
          fieldId,
          control:bezierData.start.control,
        },
        target:{
          sourceId: point.sourceId,
          fieldId: point.fieldId,
          control: bezierData.end.control
        }
      }
      const conns=[...data.connections,newConnection];
      if(onDataConnectionChange){
        onDataConnectionChange(conns);
      }
      console.log(point);
    }
  }
  }
  getDataSourceControlPoints=(data: IDataSource): IControlPoint[] =>{
    const {width: w, field} = constants.dataSource;
    const {height: h} = field;
    const {offset} = data;
  
    return data.fields.flatMap<IControlPoint>((f, i) => [
      {
        sourceId: data.id,
        fieldId: f.id,
        fromSource: true,
        center: pointIncrease({x: w, y: (1.5 + i) * h}, offset),
      },
      {
        sourceId: data.id,
        fieldId: f.id,
        fromSource: false,
        center: pointIncrease({x: 0, y: (1.5 + i) * h}, offset),
      }]);
    
  }
}

interface IControlPoint {
  sourceId: string;
  fieldId: string;
  fromSource: boolean;
  center: IPoint;
}


function contains(rect: IRect, point: IPoint) {
  const result = (
    Math.abs(point.x-rect.x)<=rect.w&&Math.abs(point.y-rect.y)<=rect.h
  );
  if (result) {
    console.log(result);
  }
  return result;
}