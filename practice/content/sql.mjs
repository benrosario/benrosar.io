// Site-authored datasets exercise boundaries and joins, beyond the examples printed on the exams.
const table = (columns, rows) => ({ columns: columns.split(',').map(s => s.trim().split(' ')), rows });
// Summer 2026 Final Q9: the exam's tables, then variants with tied teammates and equal point differences (ties and
// the secondary ORDER BY), and team totals at exactly 100 and just over (the HAVING boundary).
const F1_DRIVERS = [['ANT','ITA','Mercedes',204],['RUS','GBR','Mercedes',154],['HAM','GBR','Ferrari',159],['LEC','MON','Ferrari',126],['NOR','GBR','McLaren',103],['PIA','AUS','McLaren',92],['VER','NED','Red Bull Racing',91],['HAD','FRA','Red Bull Racing',60],['LAW','NZL','Racing Bulls',39],['LIN','GBR','Racing Bulls',22],['GAS','FRA','Alpine',42],['COL','ARG','Alpine',19],['BEA','GBR','Haas F1 Team',18],['OCO','FRA','Haas F1 Team',3],['BOR','BRA','Audi',10],['HUL','GER','Audi',0],['SAI','ESP','Williams',6],['ALB','THA','Williams',5],['BOT','FIN','Cadillac',0],['PER','MEX','Cadillac',0],['ALO','ESP','Aston Martin',1],['STR','CAN','Aston Martin',0]];
const F1_RACES = [['08 March','RUS',58],['15 March','ANT',56],['29 March','ANT',53],['03 May','ANT',57],['24 May','ANT',68],['07 June','ANT',78],['14 June','HAM',66],['28 June','RUS',71],['05 July','LEC',52],['19 July','ANT',44]];
const F1_VARIANTS = [{}, { OCO: 18, STR: 1, LIN: 6 }, { HAD: 9, PIA: 0, LAW: 61, LIN: 40 }];
const fixtures = {
  students: [0, 1, 2].map(k => ({
    students: table('name TEXT, discussion_id INTEGER, keyword TEXT', Array.from({ length: 65 + k }, (_, i) => [`student${i}`, i < 20+k ? 4 : i < 42+k ? 8 : 12, i < 35+k ? 'tree' : 'list'])),
    discussions: table('id INTEGER, ta TEXT, room TEXT', [[4,'Ada','A'],[8,'Grace','B'],[12,'Lin','C'],[19,'Empty','D']])
  })),
  ranks: [0, 1, 2].map(k => ({ ranks: table('eventId TEXT, result REAL, personName TEXT, personId TEXT', [
    ['333',1200+k,'A','a'],['333oh',900+k,'A','a'],['333',700+k,'B','b'],['333oh',1100+k,'B','b'],
    ['333',1500+k,'C','c'],['333oh',1000+k,'C','c'],['444',500,'A','a'],['333',1000,'D','d'],['333oh',1000,'D','d'],['333',800,'E','e']]) })),
  results: [0, 1, 2].map(k => ({
    results: table('eventId TEXT, result REAL, personName TEXT, personId TEXT', Array.from({length:11},(_,i)=>Array.from({length:i+1},(_,j)=>['333oh',850+i*11+k+j,`Name${i}`,`p${i}`])).flat().concat([['333oh',1200,'Name0','p0'],['333',700,'Name0','p0'],['333oh',1000,'Name0','p0']])),
    persons: table('name TEXT, country TEXT, id TEXT', Array.from({length:11},(_,i)=>[`Name${i}`,i%2?'USA':'Canada',`p${i}`]))
  })),
  basketball: [0, 1, 2].map(k => ({
    box_scores: table('name TEXT, minutes REAL, points REAL, rebounds REAL, assists REAL', [
    ['A',20+k,14+k,4+k,4+k],['B',18,12+k,10+k,1],['C',16,10,7,3+k],['D',17,8,4,3],['E',17,8,5,1],['F',20,7,2,1],['G',17,6,3,2],['H',2.5,3,0,4],['I',14,2,2,3+k],['J',5,2,0,0],['K',4.9,50,50,50]]),
    nba_data: table('name TEXT, nba_team TEXT, position TEXT', [['A','Lakers','Forward'],['B','Lakers','Center'],['C','Sixers','Center'],['D','Celtics','Guard'],['E','Heat','Center'],['F','Suns','Guard'],['G','Celtics','Forward'],['H','Jazz','Center'],['I','Pacers','Guard'],['J','Tiny','Guard'],['K','Tiny','Guard']])
  })),
  f1: F1_VARIANTS.map(points => ({
    drivers: table('id TEXT, nationality TEXT, team TEXT, points INTEGER', F1_DRIVERS.map(([id, n, team, pts]) => [id, n, team, points[id] ?? pts])),
    races: table('date TEXT, winner TEXT, laps INTEGER', F1_RACES)
  })),
  majors: [0,1,2].map(k => ({
    majors: table('major TEXT, discipline TEXT, college TEXT', [['CS','STEM','Engineering'],['EE','STEM','Engineering'],['Art','Arts','Letters'],['History','Arts','Letters'],['Math','STEM','Science'],['Physics','STEM','Science'],['Solo','Other','Solo']]),
    stats: table('major TEXT, applicants REAL, admits REAL, enrolled REAL', [['CS',100+k,20,10+k],['EE',100,40,30+2*k],['Art',100,10+k,5],['History',100,50,15],['Math',100,5,4],['Physics',100,30,15],['Solo',100,50,25]])
  }))
};
const specs = {
  '61a-fa25-final/8': ['students', [[34,35],[36]]],
  '61a-su23-final/9': ['ranks', [[82,83,84,85,86,87,88]]],
  '61a-su23-final/11': ['results', [[97,98,99,100,101,102,103]]],
  '61a-su24-final/8': ['basketball', [[62],[63,64,65,66,67],[68,69,70,71,72]]],
  '61a-su25-final/6': ['majors', [[34,35,36,37]]],
  '61a-su26-final/9': ['f1', [[47,48,49,50,51,52,53],[54,55]]]
};
export function addSQL(exams) {
  for (const e of exams) for (const p of e.p) {
    const spec = specs[p.id]; if (!spec) continue;
    const chunks = p.b.flatMap(b => b.s || []).filter(g => g.lang === 'sql' && g.f);
    // Repair transcription/key errors so the executable reference follows the question's intended task.
    if (p.id === '61a-su24-final/8') {
      chunks[2].f.i = 'minutes >= 5 AND b.name = n.name';
      const q = p.b.find(q => q.id === 70); q.a = [chunks[2].f.i]; q.x = 'The printed key repeats WHERE, but the template already supplies it. Use just the condition.';
    }
    if (p.id === '61a-su25-final/6') {
      chunks[0].f.a = 'SUM(enrolled) / SUM(admits)';
      const q = p.b.find(q => q.id === 34); q.a = [chunks[0].f.a]; q.x = 'The table calls this column admits. Divide total enrolled by total admits; an unweighted average of major-level rates is different.';
      delete p.b.find(q => q.id === 37).x;
    }
    if (p.id === '61a-su23-final/9') for (const [key,id] of [['b',83],['c',84]]) {
      chunks[0].f[key] = chunks[0].f[key].replace(/AS (\d\w*)/, 'AS "$1"');
      p.b.find(q => q.id === id).a = [chunks[0].f[key]];
    }
    if (p.id === '61a-su23-final/11') {
      chunks[0].f.d = "results.personId = persons.id AND eventId='333oh' AND result < 1000";
      const q = p.b.find(q => q.id === 100); q.a = [chunks[0].f.d]; q.x = 'Filter each attempt by result < 1000 before grouping. An aggregate alias such as best_result cannot be used in WHERE.';
    }
    p.sql = { fixtures: fixtures[spec[0]], chunks: chunks.map(g => ({ c:g.c, f:{...g.f}, ordered:/ORDER BY/i.test(g.c), table:g.c.match(/CREATE TABLE (\w+)/i)?.[1] })) };
    spec[1].forEach((ids, chunk) => Object.keys(chunks[chunk].f).forEach((key,i) => {
      const q = p.b.find(q => q.id === ids[i]); q.sql = {chunk,key};
      if (p.id === '61a-su23-final/9') q.rules = [{forbid:['like'],message:'This problem prohibits LIKE.'}];
    }));
  }
}
