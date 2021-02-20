import React from 'react';
import "./App.scss";
import {DataFlowChart} from './components/DataFlowChart/DataFlowChart';
import {KeyboardManager} from './components/keyboardManager';
import {getMockChart} from './flowChartMock';
import {IDataFlowChart, IFieldConnection} from './models/applicationState';

interface IAppProps {

}
interface IAppState {
  // start: IEndPoint;
  // end: IEndPoint;
  // data: IBezier;

  chartData: IDataFlowChart;

}
export class App extends React.Component<IAppProps, IAppState>{
  state: IAppState = {
    // data: {
    //   start: {
    //     point: {x: 0, y: 0},
    //     control: {x: 30, y: 0},
    //   },
    //   end: {
    //     point: {x: 100, y: 100},
    //     control: {x: 30, y: 0},
    //   },
    // }
    chartData: getMockChart(),
  };

  render() {
    const {chartData} = this.state;
    return (
      <>
        <div className="app">
          {/* <button onClick={this.onChangeBezier}>ChangeBezier</button>
          <svg>
            <Bezier data={data} onStartPointChange={(p) => {
              const {data} = this.state;
              data.start = p;
              this.setState({data});
            }} onEndPointChange={(p) => {
              const {data} = this.state;
              data.end = p;
              this.setState({data});
            }}></Bezier>
          </svg> */}
          <KeyboardManager>
          <DataFlowChart data={chartData}
            onDataSourceChange={(s) => {
              const {chartData} = this.state;
              chartData.sources = chartData.sources.map(d => d.id == s.id ? s : d);
              this.setState({chartData}, () => {
                localStorage.setItem("chartData", JSON.stringify(chartData));
              });
            }
          }
          onDataChange={(data)=>{
            this.setState({chartData:data}, () => {
              localStorage.setItem("chartData", JSON.stringify(chartData));
            });
          }}
            onDataConnectionChange={(data: IFieldConnection[])=>{
              const {chartData} = this.state;
              chartData.connections = [];
              chartData.connections=data;
              this.setState({chartData}, () => {
                localStorage.setItem("chartData", JSON.stringify(chartData));
              });
            }

            }
          ></DataFlowChart>
          </KeyboardManager>
        </div>
      </>
    )
  }


  // onChangeBezier = () => {
  //   const p1 = {x: Math.floor(Math.random() * 500), y: Math.floor(Math.random() * 500)};
  //   const p2 = {x: Math.floor(Math.random() * 500), y: Math.floor(Math.random() * 500)};

  //   const {start, end} = this.state.data;
  //   start.point = p1;
  //   end.point = p2;
  //   this.setState({data: {start, end}});
  // }
}