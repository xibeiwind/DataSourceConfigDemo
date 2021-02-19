import React from 'react';
import {IBezier, IDataFlowChart, IDataSource, IEndPoint, IFieldConnection, IPoint, IRect} from '../../models/applicationState';
import {DragableDataSource} from './DragableDataSource';
import "./DataFlowChart.scss";
import {pointIncrease} from './pointAdd';
import {constants} from "../constants";
import { v4 as uuid } from 'uuid';
import {Bezier} from './Bezier';
const {dataSource: settings} = constants;
const {size} = constants.dataSource.field.controlPoint;
interface IDataFlowChartProps {
  data: IDataFlowChart;
  onDataSourceChange(data: IDataSource): void;
  onDataConnectionChange(data: IFieldConnection[]): void;
}
interface IDataFlowChartState {
  points: IControlPoint[];
}
export class DataFlowChart extends React.Component<IDataFlowChartProps, IDataFlowChartState>{
  state: IDataFlowChartState = {points: []};
  activeSourceId: string;
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
    return (
      <>
        <svg className="data-flow-chart">
          {sources.map((s, i) => <DragableDataSource
            source={s} key={i}
            onDrag={(p: IPoint) => {
              s.offset = pointIncrease(s.offset ?? {x: 0, y: 0}, p);
              this.props.onDataSourceChange(s);
            }}
            onControlPointDragEnd={this.onControlPointDragEnd}
            onActiveControlChanged={this.onActiveControlChanged}
          />
          )}
          {
            connections.map((c) =>
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
              />
            )
          }
        </svg>
      </>
    )
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