import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs';
import{join}from'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const id of readdirSync(I).sort()){
 const d=join(I,id);let p=readFileSync(join(d,'program.bin')),inp;
 try{inp=readFileSync(join(d,'input.bin'))}catch(e){inp=new Uint8Array(0)}
 const r=run(p,inp),od=join(O,id);
 mkdirSync(od,{recursive:true});writeFileSync(join(od,'stdout.bin'),r.o);writeFileSync(join(od,'exit.txt'),r.e+'\n');
}
function run(p,inp){
 const plen=p.length,st=new Int32Array(256),mem=new Int32Array(256),cs=new Int32Array(64);
 let sp=0,csp=0,pc=0,steps=0,ip=0,inlen=inp.length;
 let out=new Uint8Array(4096),olen=0,exit=0,done=false;
 const MAX=1000000,OLIM=65536;
 const grow=()=>{const n=out.length*2,t=new Uint8Array(n);t.set(out);out=t};
 while(!done){
  if(steps>=MAX){exit=10;break}
  if(pc<0||pc>=plen){exit=9;break}
  const op=p[pc];let a,b;
  switch(op){
   case 0:exit=0;done=true;break;
   case 1:if(sp>=256){exit=3;done=true;break}if(pc+1>=plen){exit=9;done=true;break}st[sp++]=(p[pc+1]<<24)>>24;pc+=2;break;
   case 2:if(sp>=256){exit=3;done=true;break}if(pc+4>=plen){exit=9;done=true;break}st[sp++]=p[pc+1]|(p[pc+2]<<8)|(p[pc+3]<<16)|(p[pc+4]<<24);pc+=5;break;
   case 3:if(sp<1){exit=2;done=true;break}sp--;pc++;break;
   case 4:if(sp<1){exit=2;done=true;break}if(sp>=256){exit=3;done=true;break}st[sp]=st[sp-1];sp++;pc++;break;
   case 5:if(sp<2){exit=2;done=true;break}a=st[sp-1];st[sp-1]=st[sp-2];st[sp-2]=a;pc++;break;
   case 6:if(sp<2){exit=2;done=true;break}if(sp>=256){exit=3;done=true;break}st[sp]=st[sp-2];sp++;pc++;break;
   case 7:if(sp<3){exit=2;done=true;break}a=st[sp-3];st[sp-3]=st[sp-2];st[sp-2]=st[sp-1];st[sp-1]=a;pc++;break;
   case 16:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];st[sp-1]=(a+b)|0;pc++;break;
   case 17:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];st[sp-1]=(a-b)|0;pc++;break;
   case 18:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];st[sp-1]=Math.imul(a,b);pc++;break;
   case 19:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];if(b===0){exit=4;done=true;break}st[sp-1]=Math.trunc(a/b)|0;pc++;break;
   case 20:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];if(b===0){exit=4;done=true;break}st[sp-1]=(a%b)|0;pc++;break;
   case 21:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];if(b===0){exit=4;done=true;break}st[sp-1]=((a>>>0)/(b>>>0))|0;pc++;break;
   case 22:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];if(b===0){exit=4;done=true;break}st[sp-1]=((a>>>0)%(b>>>0))|0;pc++;break;
   case 23:if(sp<1){exit=2;done=true;break}st[sp-1]=(-st[sp-1])|0;pc++;break;
   case 24:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];st[sp-1]=a&b;pc++;break;
   case 25:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];st[sp-1]=a|b;pc++;break;
   case 26:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];st[sp-1]=a^b;pc++;break;
   case 27:if(sp<1){exit=2;done=true;break}st[sp-1]=~st[sp-1];pc++;break;
   case 28:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];st[sp-1]=a<<(b&31);pc++;break;
   case 29:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];st[sp-1]=a>>(b&31);pc++;break;
   case 30:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];st[sp-1]=(a>>>(b&31))|0;pc++;break;
   case 32:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];st[sp-1]=a===b?1:0;pc++;break;
   case 33:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];st[sp-1]=a<b?1:0;pc++;break;
   case 34:if(sp<2){exit=2;done=true;break}b=st[--sp];a=st[sp-1];st[sp-1]=(a>>>0)<(b>>>0)?1:0;pc++;break;
   case 48:if(pc+2>=plen){exit=9;done=true;break}pc+=3+(((p[pc+1]|(p[pc+2]<<8))<<16)>>16);break;
   case 49:if(sp<1){exit=2;done=true;break}a=st[--sp];if(pc+2>=plen){exit=9;done=true;break}if(a===0)pc+=3+(((p[pc+1]|(p[pc+2]<<8))<<16)>>16);else pc+=3;break;
   case 50:if(sp<1){exit=2;done=true;break}a=st[--sp];if(pc+2>=plen){exit=9;done=true;break}if(a!==0)pc+=3+(((p[pc+1]|(p[pc+2]<<8))<<16)>>16);else pc+=3;break;
   case 51:if(csp>=64){exit=7;done=true;break}if(pc+2>=plen){exit=9;done=true;break}cs[csp++]=pc+3;pc=p[pc+1]|(p[pc+2]<<8);break;
   case 52:if(csp<1){exit=8;done=true;break}pc=cs[--csp];break;
   case 64:if(sp<1){exit=2;done=true;break}a=st[--sp];if(a<0||a>255){exit=6;done=true;break}st[sp++]=mem[a];pc++;break;
   case 65:if(sp<2){exit=2;done=true;break}a=st[--sp];b=st[--sp];if(a<0||a>255){exit=6;done=true;break}mem[a]=b;pc++;break;
   case 80:if(sp<1){exit=2;done=true;break}a=st[--sp];if(olen>=OLIM){exit=11;done=true;break}if(a<0){if(olen+1>OLIM){exit=11;done=true;break}if(olen>=out.length)grow();out[olen++]=45;a=-a}{const t=new Uint8Array(12);let n=0;do{t[n++]=(a%10)+48;a=Math.floor(a/10)}while(a>0);if(olen+n>OLIM){exit=11;done=true;break}while(n>0){if(olen>=out.length)grow();out[olen++]=t[--n]}}pc++;break;
   case 81:if(sp<1){exit=2;done=true;break}a=st[--sp];if(olen>=OLIM){exit=11;done=true;break}if(olen>=out.length)grow();out[olen++]=a&255;pc++;break;
   case 82:if(sp>=256){exit=3;done=true;break}st[sp++]=ip<inlen?inp[ip++]:-1;pc++;break;
   case 83:if(sp<1){exit=2;done=true;break}exit=st[--sp]&255;done=true;break;
   default:exit=5;done=true;break;
  }
  steps++;
 }
 return{o:out.subarray(0,olen),e:exit};
}