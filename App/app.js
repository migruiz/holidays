const { Observable, merge, timer, interval } = require('rxjs');
const { mergeMap, withLatestFrom, map, share, shareReplay, filter, mapTo, take, debounceTime, throttle, throttleTime, startWith, takeWhile, delay, scan, distinct, distinctUntilChanged, tap, flatMap, takeUntil, toArray, groupBy, first } = require('rxjs/operators');
var mqtt = require('./mqttCluster.js');
global.mtqqLocalPath = 'mqtt://192.168.0.11';
var spawn = require('child_process').spawn;
const CronJob = require('cron').CronJob;
const { DateTime } = require('luxon');


console.log(`holidays current time ${DateTime.now()}`);
global.mtqqLocalPath = 'mqtt://192.168.0.11';
const START_MAX_DELAY = 15 * 60 * 1000
const KEEP_ON_MIN = 20 * 60 * 1000
const MAX_ON = 60 * 60 * 1000 - (START_MAX_DELAY + KEEP_ON_MIN)
const operationHours = [2, 7, 15, 16, 17, 18, 19, 20, 21, 22]


const getHouseAreaStream = () => {

  const everyHourStream = new Observable(subscriber => {
    new CronJob(
      `0 * * * *`,
      function () {
        subscriber.next(true);
      },
      null,
      true,
      'Europe/Dublin'
    );
  });


  const stream = everyHourStream.pipe(
    filter(_ => operationHours.includes(DateTime.now().hour)),
    mergeMap(
      _ => interval(Math.floor(Math.random() * START_MAX_DELAY) + 0).pipe(mapTo("on"), first())
    ),
    mergeMap(
      onSignal => interval(Math.floor(Math.random() * MAX_ON) + KEEP_ON_MIN).pipe(mapTo("off"), first(), startWith(onSignal))
    )
  )
  return stream;
}
const houseAreas = [
  {
    area: 'kitchen',
    stream: getHouseAreaStream(),
    onAction: async () => {
      console.log("kitchen on action")
        (await mqtt.getClusterAsync()).publishMessage('kitchen/lights', '1000');
    },
    offAction: async () => {
      console.log("kitchen off action")
        (await mqtt.getClusterAsync()).publishMessage('kitchen/lights', '0');
    }
  },
  {
    area: 'livingroom',
    stream: getHouseAreaStream(),
    onAction: async () => {
      console.log("livingroom on action")
        (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x2c1165fffed897d3/set', JSON.stringify({ brightness: 254 }));
      (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x2c1165fffed8947e/set', JSON.stringify({ brightness: 254 }));
    },
    offAction: async () => {
      console.log("livingroom off action")
        (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x2c1165fffed897d3/set', JSON.stringify({ brightness: 0 }));
      (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x2c1165fffed8947e/set', JSON.stringify({ brightness: 0 }));
    }
  },
  {
    area: 'aleroom',
    stream: getHouseAreaStream(),
    onAction: async () => {
      console.log("aleroom on action")
        (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x0c4314fffe20d4f8/set', JSON.stringify({ state: 'ON' }));
      (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x385b44fffee7a042/set', JSON.stringify({ state: 'ON' }));
    },
    offAction: async () => {
      console.log("aleroom off action")
        (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x0c4314fffe20d4f8/set', JSON.stringify({ state: 'OFF' }));
      (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x385b44fffee7a042/set', JSON.stringify({ state: 'OFF' }));
    }
  },
  {
    area: 'masterroom',
    stream: getHouseAreaStream(),
    onAction: async () => {
      console.log("masterroom on action")
        (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x04cd15fffe9d3c8a/set', JSON.stringify({ brightness: 254 }));
      (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x04cd15fffe8a196d/set', JSON.stringify({ brightness: 254 }));
    },
    offAction: async () => {
      console.log("masterroom off action")
        (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x04cd15fffe9d3c8a/set', JSON.stringify({ brightness: 0 }));
      (await mqtt.getClusterAsync()).publishMessage('zigbee2mqtt/0x04cd15fffe8a196d/set', JSON.stringify({ brightness: 0 }));
    }
  }
]

for (const houseArea of houseAreas) {
  houseArea.stream
    .subscribe(async m => {
      console.log(`${houseArea.area} - ${m} - time ${DateTime.now()}`)
      if (m === 'on') {
        houseArea.onAction();
      }
      else {
        houseArea.offAction();
      }
    })
}



