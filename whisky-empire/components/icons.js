const paths={
 upgrade:'M14 3 5 14h6l-1 7 9-11h-6Z',
 archive:'M3 3h18v5H3Zm2 5v13h14V8m-10 4h6',
 home:'M3 11 12 3l9 8v10h-6v-7H9v7H3Z',
 work:'M5 5h14l-2 15H7ZM4 5h16M8 9l1 7m6-7-1 7M18 2v3M3 12h3',
 scratch:'M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4ZM15 5v3m0 3v2m0 3v3M7 9l3 3-3 3',
 inventory:'M5 3h4v4l2 3v10H3V10l2-3ZM16 3h3v4l2 3v10h-8V10l3-3ZM3 14h8m2 0h8',
 market:'M3 7h15l-4-4m7 14H6l4 4M3 7v5m18 5v-5',
 auction:'m4 4 6 6m1-7 6 6m-9 4 9-9m-6 7 7 7m-6 3h10v3H12Z',
 chart:'M3 3v18h18M6 15l4-5 4 3 7-8',
 stats:'m12 3 3 6 6 1-4 4 1 7-6-3-6 3 1-7-4-4 6-1Z',
 arrow:'M5 12h14m-6-6 6 6-6 6',
 coin:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3 5h-4a3 3 0 0 0 0 8h4m-7-5h6m-6 2h6',
 sound:'M3 9h4l5-5v16l-5-5H3Zm13-2a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16',
 gift:'M3 8h18v5H3Zm2 5v8h14v-8M12 8v13M12 8C2 8 5-1 9 4Zm0 0c10 0 7-9 3-4Z',
};
export function icon(name){return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]??paths.stats}"/></svg>`;}
