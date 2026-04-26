const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'chapters.json');
let chapters = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const quizzes = {
    62: [
        { question: 'Saan balak itago ni Elias si Ibarra matapos ang pagtakas?', options: ['Sa Bulacan', 'Sa Mandaluyong', 'Sa San Diego', 'Sa Laguna'], answer: 1 },
        { question: 'Saan itinago ni Elias ang salapi ni Ibarra?', options: ['Sa ilalim ng tulay', 'Sa loob ng simbahan', 'Sa paanan ng balete', 'Sa bahay ni Kapitan Tiago'], answer: 2 },
        { question: 'Ano ang dahilan ni Elias kung bakit hindi siya makakasama kay Ibarra sa ibang bansa?', options: ['Dahil sa kaniyang pamilya', 'Dahil nais niyang mamatay sa piling ng kaniyang bayan', 'Dahil wala siyang pasaporte', 'Dahil mayroon siyang sakit'], answer: 1 },
        { question: 'Anong ilog ang sinabing inawit ni Francisco Baltazar?', options: ['Ilog Pasig', 'Ilog Beata', 'Ilog San Gabriel', 'Ilog Marikina'], answer: 1 },
        { question: 'Ano ang ginamit ni Elias upang itago si Ibarra sa loob ng bangka?', options: ['Damo', 'Sakate', 'Katsa', 'Banig'], answer: 1 },
        { question: 'Sino ang tumugis sa bangka nina Elias at Ibarra sa lawa?', options: ['Ang mga tulisan', 'Ang mga guwardiya sibil at falua', 'Ang mga sakristan', 'Si Padre Salvi'], answer: 1 },
        { question: 'Ano ang ginawa ni Elias upang iligtas si Ibarra sa mga tumutugis?', options: ['Nakipagbarilan siya', 'Tumalon siya sa tubig upang iligaw ang mga ito', 'Nagkunwari siyang patay', 'Nagsindi siya ng apoy'], answer: 1 },
        { question: 'Saan nagkasundong magkikita sina Elias at Ibarra?', options: ['Sa Maynila', 'Sa libingan ng ingkong ni Ibarra', 'Sa bahay ni Maria Clara', 'Sa Europa'], answer: 1 },
        { question: 'Anong bahid ang nakita ng isang sumasagwan sa tubig matapos ang pagtugis?', options: ['Damit', 'Dugo', 'Pera', 'Sumbrero'], answer: 1 },
        { question: 'Bakit tinawag ni Ibarra ang kaniyang sarili na "filibustero"?', options: ['Dahil siya ay magnanakaw', 'Dahil nais niyang lumaban alang-alang sa kaniyang bayan', 'Dahil siya ay kaaway ng simbahan', 'Dahil siya ay dayuhan'], answer: 1 }
    ],
    63: [
        { question: 'Sino ang dumating upang umasiste sa kasal ni Maria Clara?', options: ['Padre Salvi', 'Padre Damaso', 'Padre Sibyla', 'Ang Gobernador'], answer: 1 },
        { question: 'Ano ang tanging hiling ni Maria Clara kay Padre Damaso?', options: ['Na bigyan siya ng pera', 'Na sirain ang kaniyang kasal kay Linares', 'Na hanapin si Ibarra', 'Na pagalingin siya'], answer: 1 },
        { question: 'Bakit ayaw ni Padre Damaso na ikasal si Maria Clara kay Ibarra?', options: ['Dahil mahirap si Ibarra', 'Dahil nais niyang protektahan si Maria Clara sa kapahamakan', 'Dahil galit siya sa pamilya Ibarra', 'Lahat ng nabanggit'], answer: 3 },
        { question: 'Ano ang dalawang pagpipilian ni Maria Clara matapos mabalitang patay na si Ibarra?', options: ['Mag-asawa o Magtrabaho', 'Kumbento o Kamatayan', 'Mag-aral o Magmongha', 'Tumakas o Lumaban'], answer: 1 },
        { question: 'Ano ang naging reaksyon ni Padre Damaso nang malamang nais magmongha ni Maria Clara?', options: ['Natuwa siya', 'Umiyak siya tulad ng isang batà', 'Nagalit siya nang husto', 'Hindi siya naniwala'], answer: 1 },
        { question: 'Ano ang balitang nabasa ni Maria Clara sa peryodiko?', options: ['Ang kaniyang kasal', 'Ang pagkamatay ni Ibarra sa lawa', 'Ang pag-alis ni Padre Damaso', 'Ang pista sa San Diego'], answer: 1 },
        { question: 'Sino ang lalaking itinakda ng ama ni Maria Clara na mapangasawa niya?', options: ['Ibarra', 'Linares', 'Elias', 'Kapitan Tiago'], answer: 1 },
        { question: 'Ano ang sinabi ni Padre Damaso tungkol sa kinabukasan ni Maria Clara kung ikakasal siya sa isang katutubo?', options: ['Magiging maligaya siya', 'Makikita niya ang kaniyang mga anak na inuutusan at pinaparusahan', 'Magiging mayaman siya', 'Magiging kura rin ang kaniyang mga anak'], answer: 1 },
        { question: 'Bakit pumayag din sa huli si Padre Damaso na magmongha si Maria Clara?', options: ['Dahil ayaw niyang mamatay ang dalaga', 'Dahil gusto niya ang kumbento', 'Dahil iniutos ng kura', 'Dahil sa pera'], answer: 0 },
        { question: 'Ano ang huling ginawa ni Maria Clara sa kura bago ito umalis?', options: ['Nagalit siya', 'Hinatulan niya ito', 'Hinagkan ang mga kamay nito', 'Umiwas siya'], answer: 2 }
    ],
    64: [
        { question: 'Sino ang batà na sugatan at hinahanap ang kaniyang ina sa gubat?', options: ['Crispin', 'Basilio', 'Tarsilo', 'Lucas'], answer: 1 },
        { question: 'Sino ang pamilyang kumalinga kay Basilio habang siya ay sugatan?', options: ['Ang mga Ibarra', 'Isang pamilyang Tagalog sa bundok', 'Si Kapitan Basilio', 'Si Sisa'], answer: 1 },
        { question: 'Ano ang naging kalagayan ni Sisa nang matagpuan siya ni Basilio?', options: ['Siya ay patay na', 'Siya ay baliw at pakanta-kanta', 'Siya ay nakakulong', 'Siya ay nasa simbahan'], answer: 1 },
        { question: 'Anong mahalagang araw ang ipinagdiriwang sa kabanatang ito?', options: ['Pista ng San Diego', 'Nochebuena (Pasko)', 'Bagong Taon', 'Mahal na Araw'], answer: 1 },
        { question: 'Saan huling natagpuan ni Basilio ang kaniyang ina?', options: ['Sa simbahan', 'Sa pintuan ng puntod sa gubat ni Ibarra', 'Sa plasa', 'Sa bahay ni Kapitan Basilio'], answer: 1 },
        { question: 'Ano ang nangyari kay Sisa nang makilala niya si Basilio?', options: ['Natuwa siya at gumaling', 'Yumakap siya at saka pumanaw', 'Tumakas siya muli', 'Hindi niya ito nakilala'], answer: 1 },
        { question: 'Sino ang di-kakilalang lalaking sugatan na nakita ni Basilio sa gubat?', options: ['Ibarra', 'Elias', 'Padre Salvi', 'Isang tulisan'], answer: 1 },
        { question: 'Ano ang huling hiling ng di-kakilalang lalaki kay Basilio?', options: ['Na iligtas siya', 'Na sunugin ang kaniyang bangkay kasama ang ina ni Basilio', 'Na hanapin si Maria Clara', 'Na ibigay ang ginto sa kura'], answer: 1 },
        { question: 'Ano ang ipinagbilin ng lalaki na mahuhukay ni Basilio sa pook na iyon?', options: ['Mga aklat', 'Ginto', 'Baril', 'Liham'], answer: 1 },
        { question: 'Ano ang huling sinabi ng lalaki tungkol sa mga nabuwal sa dilim ng gabi?', options: ['Na sila ay kalimutan na', 'Huwag silang lilimutin ng mga makakakita sa bukang-liwayway', 'Na sila ay mga kriminal', 'Na sila ay maghihiganti'], answer: 1 }
    ]
};

chapters.forEach(c => {
    c.quiz = quizzes[c.chapter_number] || [
        { 
            question: 'Sino ang may-akda ng Noli Me Tangere?', 
            options: ['Jose Rizal', 'Andres Bonifacio', 'Emilio Aguinaldo', 'Apolinario Mabini'], 
            answer: 0 
        }
    ];
});

fs.writeFileSync(filePath, JSON.stringify(chapters, null, 4));
console.log('Quiz data updated successfully!');
