var https=require("https")
var pngObj={}
fetch('https://raw.githubusercontent.com/maptw/256/main/png.list').then(res=>res.text())
.then(data=>{
 const arr=data.split('\n')
 for(const item of arr){
  const path=item.split('/')
  if(!pngObj[path[0]])pngObj[path[0]]={}
  if(!pngObj[path[0]][path[1]])pngObj[path[0]][path[1]]=[]
  pngObj[path[0]][path[1]].push(path[2])
 }
 console.log(Object.keys(pngObj))
 request()
})






const t=new Date()
var sum=0,end
async function request(){
 for(let x=220200;x<220225;x++){sum++
  await new Promise(resolve=>{
   if(sum<=25)resolve()
   https.get(`https://tw.iqiq.cc/18/${x}/112250.png`,res=>{res.destroy()
    sum--;resolve();console.log(x,res.headers['cf-cache-status'],sum)
    if(end&&sum==0){console.log(new Date()-t+'ms');process.exit()}
   })
  })
 }
 end=true
}