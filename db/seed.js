require('dotenv').config()
const { supabase } = require('./supabase')

const drivers = [
  { pos:1,  flag:'🇮🇹', name:'Andrea Kimi Antonelli', short:'ANT', team:'Mercedes',      number:12, pts:100, emoji:'🚀', nat:'Italian',    age:18, born:'2006', bio:'Prodigio italiano. Primera temporada completa en F1 y ya lidera el campeonato.' },
  { pos:2,  flag:'🇬🇧', name:'George Russell',        short:'RUS', team:'Mercedes',      number:63, pts:80,  emoji:'🧠', nat:'British',    age:27, born:'1998', bio:'Veterano del equipo. Técnico y consistente.' },
  { pos:3,  flag:'🇲🇨', name:'Charles Leclerc',       short:'LEC', team:'Ferrari',       number:16, pts:59,  emoji:'🔴', nat:'Monégasque', age:28, born:'1997', bio:'Ídolo de Maranello. Sueña con el título que se le escapa.' },
  { pos:4,  flag:'🇬🇧', name:'Lando Norris',          short:'NOR', team:'McLaren',       number:4,  pts:51,  emoji:'🧡', nat:'British',    age:25, born:'2000', bio:'Velocidad pura. McLaren apuesta todo en él.' },
  { pos:5,  flag:'🇬🇧', name:'Lewis Hamilton',        short:'HAM', team:'Ferrari',       number:44, pts:51,  emoji:'👑', nat:'British',    age:41, born:'1985', bio:'8 veces campeón. Su última aventura en Ferrari.' },
  { pos:6,  flag:'🇦🇺', name:'Oscar Piastri',         short:'PIA', team:'McLaren',       number:81, pts:43,  emoji:'🦘', nat:'Australian', age:24, born:'2001', bio:'Silencioso y letal. Cada carrera mejora.' },
  { pos:7,  flag:'🇳🇱', name:'Max Verstappen',        short:'VER', team:'Red Bull',      number:1,  pts:26,  emoji:'🐂', nat:'Dutch',      age:28, born:'1997', bio:'Tricampeón sufriendo con el nuevo reglamento.' },
  { pos:8,  flag:'🇬🇧', name:'Oliver Bearman',        short:'BEA', team:'Haas',          number:87, pts:17,  emoji:'🐻', nat:'British',    age:19, born:'2005', bio:'Joven promesa. Haas apostó fuerte en él.' },
  { pos:9,  flag:'🇫🇷', name:'Pierre Gasly',          short:'GAS', team:'Alpine',        number:10, pts:16,  emoji:'🇫🇷', nat:'French',   age:29, born:'1996', bio:'Experiencia y madurez en Alpine.' },
  { pos:10, flag:'🇳🇿', name:'Liam Lawson',           short:'LAW', team:'Racing Bulls',  number:30, pts:10,  emoji:'🥝', nat:'New Zealander', age:22, born:'2002', bio:'Debut oficial. Aprendiendo en las mejores pistas.' },
  { pos:11, flag:'🇦🇷', name:'Franco Colapinto',      short:'COL', team:'Alpine',        number:43, pts:7,   emoji:'🇦🇷', nat:'Argentine', age:21, born:'2003', bio:'El argentino. P7 en Miami, su mejor resultado.' },
  { pos:12, flag:'🇸🇪', name:'Arvid Lindblad',        short:'LIN', team:'Racing Bulls',  number:6,  pts:4,   emoji:'🇸🇪', nat:'Swedish',  age:18, born:'2007', bio:'El más joven del grid. Enorme futuro.' },
  { pos:13, flag:'🇫🇷', name:'Isack Hadjar',          short:'HAD', team:'Red Bull',      number:2,  pts:4,   emoji:'🇫🇷', nat:'French',   age:20, born:'2004', bio:'Académico Red Bull. Compañero de Verstappen.' },
  { pos:14, flag:'🇪🇸', name:'Carlos Sainz',          short:'SAI', team:'Williams',      number:55, pts:4,   emoji:'🐂', nat:'Spanish',   age:30, born:'1994', bio:'El matador. Nuevo desafío en Williams.' },
  { pos:15, flag:'🇧🇷', name:'Gabriel Bortoleto',     short:'BOR', team:'Audi',          number:5,  pts:2,   emoji:'🇧🇷', nat:'Brazilian', age:20, born:'2004', bio:'Campeón F2 2024. Debut en el proyecto Audi.' },
  { pos:16, flag:'🇫🇷', name:'Esteban Ocon',          short:'OCO', team:'Haas',          number:31, pts:1,   emoji:'🇫🇷', nat:'French',   age:29, born:'1996', bio:'Regresa a la F1 con Haas.' },
  { pos:17, flag:'🇹🇭', name:'Alexander Albon',       short:'ALB', team:'Williams',      number:23, pts:1,   emoji:'🇹🇭', nat:'Thai',     age:28, born:'1996', bio:'Leal a Williams. Experiencia y consistencia.' },
  { pos:18, flag:'🇩🇪', name:'Nico Hulkenberg',       short:'HUL', team:'Audi',          number:27, pts:0,   emoji:'🇩🇪', nat:'German',   age:37, born:'1987', bio:'Veterano. Lidera el desarrollo técnico de Audi.' },
  { pos:19, flag:'🇫🇮', name:'Valtteri Bottas',       short:'BOT', team:'Cadillac',      number:77, pts:0,   emoji:'🇫🇮', nat:'Finnish',  age:36, born:'1989', bio:'El finlandés zen. Le robaron el auto en Miami.' },
  { pos:20, flag:'🇲🇽', name:'Sergio Perez',          short:'PER', team:'Cadillac',      number:11, pts:0,   emoji:'🌮', nat:'Mexican',   age:36, born:'1990', bio:'Checo vive una segunda vida en Cadillac.' },
  { pos:21, flag:'🇪🇸', name:'Fernando Alonso',       short:'ALO', team:'Aston Martin',  number:14, pts:0,   emoji:'⚡', nat:'Spanish',   age:44, born:'1981', bio:'El eterno. Dos veces campeón, sigue compitiendo.' },
  { pos:22, flag:'🇨🇦', name:'Lance Stroll',          short:'STR', team:'Aston Martin',  number:18, pts:0,   emoji:'🇨🇦', nat:'Canadian', age:27, born:'1998', bio:'Hijo del dueño de Aston Martin.' },
]

const constructors = [
  { pos:1,  name:'Mercedes',     engine:'Mercedes', pts:180, color_hex:'#00D2BE', driver1:'Antonelli', driver2:'Russell',   note:'Domina el nuevo reglamento. Motor con controversia.' },
  { pos:2,  name:'Ferrari',      engine:'Ferrari',  pts:112, color_hex:'#E8002D', driver1:'Leclerc',   driver2:'Hamilton',  note:'Hamilton adaptándose. Potencia pero inestabilidad.' },
  { pos:3,  name:'McLaren',      engine:'Mercedes', pts:94,  color_hex:'#FF8000', driver1:'Norris',    driver2:'Piastri',   note:'Dupla feroz. Piastri acelerando fuerte.' },
  { pos:4,  name:'Red Bull',     engine:'Red Bull', pts:30,  color_hex:'#3671C6', driver1:'Verstappen',driver2:'Hadjar',    note:'Verstappen frustrado. RB21 no se adapta.' },
  { pos:5,  name:'Alpine',       engine:'Mercedes', pts:23,  color_hex:'#0093CC', driver1:'Gasly',     driver2:'Colapinto', note:'Motores Mercedes desde 2026. Colapinto en alza.' },
  { pos:6,  name:'Haas',         engine:'Ferrari',  pts:18,  color_hex:'#B6BABD', driver1:'Bearman',   driver2:'Ocon',      note:'Sorpresa del año. Bearman top 8 regular.' },
  { pos:7,  name:'Racing Bulls', engine:'Red Bull', pts:14,  color_hex:'#6692FF', driver1:'Lawson',    driver2:'Lindblad',  note:'Academia Red Bull. Dos rookies prometedores.' },
  { pos:8,  name:'Williams',     engine:'Mercedes', pts:5,   color_hex:'#00A3E0', driver1:'Sainz',     driver2:'Albon',     note:'Sainz esperaba más. Williams sigue en reconstrucción.' },
  { pos:9,  name:'Audi',         engine:'Audi',     pts:2,   color_hex:'#BB86FC', driver1:'Bortoleto', driver2:'Hulkenberg',note:'Debut del proyecto Audi. Bortoleto el más rápido.' },
  { pos:10, name:'Aston Martin', engine:'Mercedes', pts:0,   color_hex:'#358C75', driver1:'Alonso',    driver2:'Stroll',    note:'Alonso sin puntos. AMR26 muy por debajo.' },
  { pos:11, name:'Cadillac',     engine:'Ferrari',  pts:0,   color_hex:'#9E9E9E', driver1:'Bottas',    driver2:'Perez',     note:'Equipo nuevo. Necesita tiempo para crecer.' },
]

const calendar = [
  { round:1,  flag:'🇦🇺', name:'Australia',    circuit:'Albert Park',           date_str:'14-16 Mar',  status:'done',     winner:'Russell',    has_sprint:false },
  { round:2,  flag:'🇨🇳', name:'China',        circuit:'Shanghai',              date_str:'21-23 Mar',  status:'done',     winner:'Antonelli',  has_sprint:true  },
  { round:3,  flag:'🇯🇵', name:'Japón',        circuit:'Suzuka',                date_str:'4-6 Abr',    status:'done',     winner:'Antonelli',  has_sprint:false },
  { round:4,  flag:'🇺🇸', name:'Miami',        circuit:'Miami Int. Autodrome',  date_str:'2-4 May',    status:'done',     winner:'Antonelli',  has_sprint:true  },
  { round:5,  flag:'🇨🇦', name:'Canadá',       circuit:'Circuit Gilles Villeneuve', date_str:'22-24 May', status:'next',  winner:null,         has_sprint:true  },
  { round:6,  flag:'🇲🇨', name:'Mónaco',       circuit:'Circuit de Monaco',     date_str:'29-31 May',  status:'upcoming', winner:null,         has_sprint:false },
  { round:7,  flag:'🇪🇸', name:'España',       circuit:'Circuit de Barcelona',  date_str:'12-14 Jun',  status:'upcoming', winner:null,         has_sprint:false },
  { round:8,  flag:'🇦🇹', name:'Austria',      circuit:'Red Bull Ring',         date_str:'26-28 Jun',  status:'upcoming', winner:null,         has_sprint:false },
  { round:9,  flag:'🇬🇧', name:'Gran Bretaña', circuit:'Silverstone',           date_str:'3-5 Jul',    status:'upcoming', winner:null,         has_sprint:true  },
  { round:10, flag:'🇧🇪', name:'Bélgica',      circuit:'Spa-Francorchamps',     date_str:'17-19 Jul',  status:'upcoming', winner:null,         has_sprint:false },
  { round:11, flag:'🇭🇺', name:'Hungría',      circuit:'Hungaroring',           date_str:'31 Jul-2 Ago', status:'upcoming', winner:null,       has_sprint:false },
  { round:12, flag:'🇳🇱', name:'Países Bajos', circuit:'Zandvoort',             date_str:'28-30 Ago',  status:'upcoming', winner:null,         has_sprint:true  },
  { round:13, flag:'🇮🇹', name:'Italia',       circuit:'Monza',                 date_str:'4-6 Sep',    status:'upcoming', winner:null,         has_sprint:false },
  { round:14, flag:'🇪🇸', name:'Madrid',       circuit:'Madrid Street Circuit', date_str:'18-20 Sep',  status:'upcoming', winner:null,         has_sprint:false },
  { round:15, flag:'🇦🇿', name:'Azerbaiyán',   circuit:'Baku City Circuit',     date_str:'25-27 Sep',  status:'upcoming', winner:null,         has_sprint:false },
  { round:16, flag:'🇸🇬', name:'Singapur',     circuit:'Marina Bay',            date_str:'2-4 Oct',    status:'upcoming', winner:null,         has_sprint:true  },
  { round:17, flag:'🇺🇸', name:'COTA',         circuit:'Circuit of the Americas', date_str:'16-18 Oct', status:'upcoming', winner:null,        has_sprint:false },
  { round:18, flag:'🇲🇽', name:'México',       circuit:'Autódromo Hermanos Rodríguez', date_str:'23-25 Oct', status:'upcoming', winner:null,   has_sprint:false },
  { round:19, flag:'🇧🇷', name:'Brasil',       circuit:'Interlagos',            date_str:'6-8 Nov',    status:'upcoming', winner:null,         has_sprint:false },
  { round:20, flag:'🇺🇸', name:'Las Vegas',    circuit:'Las Vegas Strip',       date_str:'20-22 Nov',  status:'upcoming', winner:null,         has_sprint:false },
  { round:21, flag:'🇶🇦', name:'Qatar',        circuit:'Losail',                date_str:'27-29 Nov',  status:'upcoming', winner:null,         has_sprint:false },
  { round:22, flag:'🇦🇪', name:'Abu Dhabi',    circuit:'Yas Marina',            date_str:'4-6 Dic',    status:'upcoming', winner:null,         has_sprint:false },
  { round:null, flag:'🇸🇦', name:'Arabia Saudita', circuit:'Jeddah',            date_str:'Cancelado',  status:'cancelled', winner:null,        has_sprint:false },
  { round:null, flag:'🇧🇭', name:'Bahrain',    circuit:'Sakhir',                date_str:'Cancelado',  status:'cancelled', winner:null,        has_sprint:false },
]

const racePoints = [
  { driver_name:'Antonelli', australia:18, china:32, japan:25, miami:28 },
  { driver_name:'Russell',   australia:25, china:24, japan:10, miami:17 },
  { driver_name:'Leclerc',   australia:15, china:17, japan:15, miami:14 },
  { driver_name:'Norris',    australia:10, china:16, japan:12, miami:26 },
  { driver_name:'Hamilton',  australia:12, china:18, japan:6,  miami:8  },
  { driver_name:'Piastri',   australia:0,  china:14, japan:18, miami:22 },
  { driver_name:'Verstappen',australia:8,  china:4,  japan:1,  miami:14 },
  { driver_name:'Bearman',   australia:6,  china:5,  japan:8,  miami:0  },
  { driver_name:'Gasly',     australia:1,  china:6,  japan:4,  miami:1  },
  { driver_name:'Lawson',    australia:0,  china:1,  japan:0,  miami:0  },
  { driver_name:'Colapinto', australia:0,  china:0,  japan:2,  miami:4  },
  { driver_name:'Lindblad',  australia:4,  china:0,  japan:0,  miami:0  },
  { driver_name:'Hadjar',    australia:0,  china:0,  japan:4,  miami:0  },
  { driver_name:'Sainz',     australia:0,  china:4,  japan:0,  miami:0  },
  { driver_name:'Bortoleto', australia:2,  china:0,  japan:0,  miami:0  },
  { driver_name:'Ocon',      australia:0,  china:0,  japan:1,  miami:0  },
  { driver_name:'Albon',     australia:0,  china:0,  japan:0,  miami:1  },
]

const news = [
  { title:'GP Canadá este fin de semana — Antonelli busca el póker', summary:'Sprint incluido en Montreal. Alpine llega con nueva caja de cambios Mercedes para Colapinto tras su P7 en Miami.', tag_type:'upcoming', source:'F1.com', published_date:'17 May 2026' },
  { title:'FIA estrena luces traseras de colores en Canadá', summary:'Tras el violento accidente Bearman-Colapinto en Suzuka (50G), la FIA implementa nueva normativa de señalización visual. Debut en Montreal.', tag_type:'technical', source:'Autosport', published_date:'17 May 2026' },
  { title:'FIA y equipos tienen 15 días para cambios motores 2027', summary:'Se estudia reducir la potencia eléctrica ~50kW. Verstappen no ocultó su frustración: "Esto es Fórmula E con esteroides".', tag_type:'breaking', source:'RacingNews365', published_date:'16 May 2026' },
  { title:'Colapinto llega motivado a Canadá', summary:'P7 en Miami fue su mejor resultado en F1. Alpine ya superó los 22 puntos de toda la temporada 2025. El argentino sueña con el podio.', tag_type:'paddock', published_date:'17 May 2026', source:'La Nacion' },
  { title:'Toto Wolff a rivales: "Pónganse las pilas"', summary:'El jefe de Mercedes respondió a las protestas por el supuesto artilugio de compresión 18:1 en el motor. La FIA investiga.', tag_type:'breaking', source:'Sky Sports F1', published_date:'15 May 2026' },
  { title:'Bottas: le robaron el Cadillac en Miami', summary:'Estaba en la ducha cuando el auto desapareció del paddock. Cadillac activó el rastreador GPS. El caso sigue abierto.', tag_type:'paddock', source:'The Race', published_date:'6 May 2026' },
]

async function seed() {
  console.log('🌱 Iniciando seed...')

  console.log('→ Limpiando tablas...')
  await supabase.from('race_points').delete().neq('id', 0)
  await supabase.from('race_results').delete().neq('id', 0)
  await supabase.from('calendar').delete().neq('id', 0)
  await supabase.from('constructors').delete().neq('id', 0)
  await supabase.from('drivers').delete().neq('id', 0)
  await supabase.from('news').delete().neq('id', 0)

  console.log('→ Insertando drivers...')
  const { error: e1 } = await supabase.from('drivers').insert(drivers)
  if (e1) { console.error('Error drivers:', e1); process.exit(1) }

  console.log('→ Insertando constructors...')
  const { error: e2 } = await supabase.from('constructors').insert(constructors)
  if (e2) { console.error('Error constructors:', e2); process.exit(1) }

  console.log('→ Insertando calendar...')
  const { error: e3 } = await supabase.from('calendar').insert(calendar)
  if (e3) { console.error('Error calendar:', e3); process.exit(1) }

  console.log('→ Insertando race_points...')
  const { error: e4 } = await supabase.from('race_points').insert(racePoints)
  if (e4) { console.error('Error race_points:', e4); process.exit(1) }

  console.log('→ Insertando news...')
  const { error: e5 } = await supabase.from('news').insert(news)
  if (e5) { console.error('Error news:', e5); process.exit(1) }

  console.log('✅ Seed completado!')
  process.exit(0)
}

seed()
