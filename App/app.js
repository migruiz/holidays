const { Observable, merge, timer, interval } = require('rxjs');
const { mergeMap, withLatestFrom, map, share, shareReplay, filter, mapTo, take, debounceTime, throttle, throttleTime, startWith, takeWhile, delay, scan, distinct, distinctUntilChanged, tap, flatMap, takeUntil, toArray, groupBy, first } = require('rxjs/operators');
var mqtt = require('./mqttCluster.js');
global.mtqqLocalPath = 'mqtt://192.168.0.11';
var spawn = require('child_process').spawn;
const CronJob = require('cron').CronJob;
const { DateTime } = require('luxon');


console.log(`kitchen lights current time ${DateTime.now()}`);
global.mtqqLocalPath = 'mqtt://192.168.0.11';


const everyHourStream = new Observable(subscriber => {
  new CronJob(
    `* * * * *`,
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
    _ => interval(5000).pipe(mapTo("on"), first())
  ),
  mergeMap(
    onSignal => interval(5000).pipe(mapTo("off"), first(), startWith(onSignal))
  )
)

stream
  .subscribe(async m => {
    console.log(`${m} time ${DateTime.now()}`)
  })

