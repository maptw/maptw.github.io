var fs=require("fs")
var http=require("http"),https=require("https")
/*fs.readFile('blank.png',(err,buf)=>{
 if(err){console.error('Error reading file:',err);return}
 const base64String=buf.toString('base64')
 console.log(base64String)
 console.log(Buffer.from(base64String,'base64').length)
})*/
var pngObj={}
fs.readFile('png.list','utf8',(err,data)=>{
 if(err){console.error('Error reading file:',err);return}
 const arr=data.split('\n')
 for(const item of arr){
  const path=item.split('/')
  if(!pngObj[path[0]])pngObj[path[0]]={}
  if(!pngObj[path[0]][path[1]])pngObj[path[0]][path[1]]=[]
  pngObj[path[0]][path[1]].push(path[2])
 }
 request(18)
})

var sum=0,end=false,statistic={SUMMATION:0},remains=''

async function request(z){
 for(let x in pngObj[z]){
  for(let y of pngObj[z][x]){
   sum++;remains+=`,/${z}/${x}/${y}`
   await new Promise(resolve=>{
    if(sum<100)resolve()
    https.get(`https://tw.iqiq.cc/${z}/${x}/${y}`,res=>{
     if(res.statusCode!=200){res.destroy();isOk();remains+=`,/${z}/${x}/${y} statusCode=${res.statusCode}`}
     else{res.resume()
      res.on('end',()=>{
       const status=res.headers['cf-cache-status']
       statistic.SUMMATION++
       if(!statistic.hasOwnProperty(status))statistic[status]=0
       statistic[status]++
       console.log('z',z,'x',x,'y',y,sum,status)
       isOk()
      })
     }
    }).on('error',err=>{isOk();remains+=`,/${z}/${x}/${y} `+err})
    function isOk(){sum--;resolve();remains=remains.replace(`,/${z}/${x}/${y}`,'');if(end&&sum==0)console.log(statistic,((statistic.HIT||0)/statistic.SUMMATION*100).toFixed(2)+' %')}
   })
  }
 }
 end=true
 setInterval(()=>{
  console.log('remains',remains)
 },1000)
}

http.createServer((req,res)=>{console.log(req.url)
 const temp=req.url.split('/')
 if(temp.length!=4||!/^\d+$/.test(temp[2])||!/^\d+\.png$/.test(temp[3])){res.writeHead(301,{Location:'https://www.cloudflarestatus.com'+req.url});res.end();return}
 //const z=+temp[1],x=+temp[2],y=+temp[3].split('.png')[0]
 //res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'max-age=315360000'})
 res.writeHead(200,{'Content-Type':'image/png',Expires:new Date('2034-8-9 0:0:0').toUTCString()})
 fs.readFile('.'+req.url,(err,data)=>{
  if(err)res.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAPoAAAD6AG1e1JrAAABFUlEQVR4nO3BMQEAAADCoPVP7WsIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA6AwBPAABo9vSmwAAAABJRU5ErkJggg=='
                             ,'base64'))//空白png
  else res.end(data)
 })
 //get(0)
 function get(t){
  https.get('https://raw.githubusercontent.com/maptw/256/main'+req.url,Res=>{
   if(Res.statusCode==200){
    const chunks=[]
    Res.on('data',chunk=>chunks.push(chunk))
    Res.on('end',()=>res.end(Buffer.concat(chunks)))}
   else if(Res.statusCode==404){
    Res.destroy();res.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAPoAAAD6AG1e1JrAAABFUlEQVR4nO3BMQEAAADCoPVP7WsIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA6AwBPAABo9vSmwAAAABJRU5ErkJggg=='
                                      ,'base64'))}//空白png
   else{console.log(Res.statusCode,req.url);Res.destroy();t+=1000;setTimeout(()=>get(t),t)}
  })
 }
}).listen(8888)
