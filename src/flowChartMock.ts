import {IDataFlowChart} from "./models/applicationState";

export function getMockChart(): IDataFlowChart {
  const json = localStorage.getItem("chartData");
  if(json){
    return JSON.parse(json);
  }

  return {
    sources: [
      {
        id: guid(),
        name: "demo",
        title: 'demo',
        fields: [
          {
            id: guid(),
            name: 'name',
            title: 'name',
          },
          {
            id: guid(),
            name: 'age',
            title: 'age',
          },
          {
            id: guid(),
            name: 'gender',
            title: 'gender',
          }
        ],
        offset:{x:0,y:0}
      },
      {
        id: guid(),
        name: "demo",
        title: 'demo',
        fields: [
          {
            id: guid(),
            name: 'name',
            title: 'name',
          },
          {
            id: guid(),
            name: 'age',
            title: 'age',
          },
          {
            id: guid(),
            name: 'gender',
            title: 'gender',
          }
        ],
        offset:{x:0,y:0}
      }
    ],
    connections: []
  };

}

export function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

