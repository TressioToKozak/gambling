import {test} from 'node:test';import assert from 'node:assert/strict';
import {createScratchMask} from '../components/scratch-mask.js';import {snapshot} from '../game/snapshot.js';
test('scratch coverage follows swept round strokes and never counts the same area twice',()=>{
 const mask=createScratchMask(400,360);assert.equal(mask.coverage,0);mask.erase({x:0,y:100},{x:400,y:100},22);const first=mask.coverage;assert.ok(first>.10&&first<.15);mask.erase({x:0,y:100},{x:400,y:100},22);assert.equal(mask.coverage,first);
 for(let y=10;y<360;y+=20)mask.erase({x:0,y},{x:400,y},22);assert.equal(mask.coverage,1);
});
test('a larger coin clears more real area; off-card movement earns no coverage',()=>{
 const small=createScratchMask(400,360),large=createScratchMask(400,360),a={x:20,y:180},b={x:380,y:180};small.erase(a,b,22);large.erase(a,b,43);assert.ok(large.coverage>small.coverage*1.7);const before=small.coverage;small.erase({x:-100,y:-100},{x:-50,y:-50},22);assert.equal(small.coverage,before);
});
test('compact UI snapshots preserve every financial field without sending full history',()=>{
 const history=Array.from({length:6000},(_,tick)=>({tick,price:100+tick})),state={balance:1234,items:[{uid:1,status:'collection'}],transactions:[{type:'work',amount:150}],pending:{uid:5},history,prices:{red:{price:250,trend:.01,history}}};const slim=snapshot(state);
 assert.equal(slim.prices.red.history.length,24);assert.equal(slim.history.length,24);assert.equal(state.history.length,6000);assert.equal(state.prices.red.history.length,6000);assert.equal(slim.balance,1234);assert.deepEqual(slim.pending,state.pending);assert.deepEqual(slim.items,state.items);assert.deepEqual(slim.transactions,state.transactions);assert.deepEqual(slim.prices.red.history.at(-1),history.at(-1));assert.equal(snapshot(state,{fullHistory:true}),state);
});
