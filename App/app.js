const { Observable, merge, timer, interval } = require('rxjs');
const { mergeMap, withLatestFrom, map, share, shareReplay, filter, mapTo, take, debounceTime, throttle, throttleTime, startWith, takeWhile, delay, scan, distinct, distinctUntilChanged, tap, flatMap, takeUntil, toArray, groupBy, first } = require('rxjs/operators');
var mqtt = require('./mqttCluster.js');
global.mtqqLocalPath = 'mqtt://192.168.0.11';
var spawn = require('child_process').spawn;
const CronJob = require('cron').CronJob;
const { DateTime } = require('luxon');


console.log(`kitchen lights current time ${DateTime.now()}`);
global.mtqqLocalPath = 'mqtt://192.168.0.11';
const START_MAX_DELAY = 15 * 60 * 1000
const KEEP_ON_MIN = 20 * 60 * 1000
const MAX_ON = 60 * 60 * 1000 - (START_MAX_DELAY + KEEP_ON_MIN)


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
    onAction: () => {

    },
    offAction: () => {

    }
  },
  {
    area: 'livingroom',
    stream: getHouseAreaStream(),
    onAction: () => {

    },
    offAction: () => {

    }
  },
  {
    area: 'aleroom',
    stream: getHouseAreaStream(),
    onAction: () => {

    },
    offAction: () => {

    }
  },
  {
    area: 'masterroom',
    stream: getHouseAreaStream(),
    onAction: () => {

    },
    offAction: () => {

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



