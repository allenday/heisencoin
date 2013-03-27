zmq = require('zmq')
YAML = require('libyaml')
fs = require('fs')
apiworker = require('apifeedr').worker
edn = require('jsedn')
ap = require('argparser')
            .nonvals('daemon')
            .parse()

settings_filename = "../config/settings.yml"
settings = YAML.parse(fs.readFileSync(settings_filename, 'utf8'))[0]

console.log("connecting to zmq job queue at "+settings.zeromq.listen)
zsock = zmq.socket('req')
zsock.connect(settings.zeromq.listen)

if(ap.opt('daemon'))
  require('daemon')({stdout: process.stdout, stderr: process.stderr})

apiworker.work(function(job_info, finisher){
  console.log('zmq dispatch job '+job_info.at('id'))
  zsock.send(edn.encode(job_info))
  zsock.on('message', function(result){
    finisher.emit('job_result', String(result))
  })
})

