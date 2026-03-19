// スコアデータ
const ronScores = [1000, 1300, 1600, 2000, 2600, 3200, 3900, 5200, 6400, 8000, 12000, 16000, 24000, 32000, 64000];
const tsumoScores = [
    {k:300,  o:500,  t:1100}, {k:400,  o:700,  t:1500}, {k:400,  o:800,  t:1600},
    {k:500,  o:1000, t:2000}, {k:700,  o:1300, t:2700}, {k:800,  o:1600, t:3200},
    {k:1000, o:2000, t:4000}, {k:1300, o:2600, t:5200}, {k:1600, o:3200, t:6400},
    {k:2000, o:4000, t:8000}, {k:3000, o:6000, t:12000},{k:4000, o:8000, t:16000},
    {k:6000, o:12000, t:24000}, {k:8000, o:16000, t:32000}
];



let mode = '', diff = 0, currentHonba = 0, activeInput = 'val1', data = { val1: '', val2: '' };
let correctV1 = 0, correctV2 = 0;
let totalQuestions = 0, correctAnswers = 0, mistakes = [], isReviewMode = false;

function setMenuHonba(h) {
    currentHonba = h;
    document.querySelectorAll('#menu .honba-btn').forEach((btn, i) => btn.classList.toggle('active', i === h));
}

function initQuiz(m) {
    mode = m; totalQuestions = 0; correctAnswers = 0; mistakes = []; isReviewMode = false;
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('quiz').classList.remove('hidden');
    generateProblem();
}

function toggleHelp() { document.getElementById('help-modal').classList.toggle('hidden'); }

function generateProblem() {
    document.getElementById('post-btns').classList.add('hidden');
    document.getElementById('result-popup').innerHTML = "";
    document.getElementById('judge-btn').disabled = false;
    document.getElementById('judge-btn').style.opacity = "1";
    document.getElementById('score-counter').innerText = `${correctAnswers} / ${totalQuestions}`;

    // 重み付けありで問題を生成
    const r = Math.random();
    if (r < 0.85) diff = Math.floor(Math.random() * 70 + 11) * 100;
    else if (r < 0.95) diff = Math.floor(Math.random() * 120 + 81) * 100;
    else diff = Math.floor(Math.random() * 200 + 201) * 100;

    const honbaText = currentHonba > 0 ? ` <small style="color:var(--warning)">[${currentHonba}本場]</small>` : "";
    document.getElementById('q-diff').innerHTML = `${diff.toLocaleString()}点差${honbaText}をまくれ！`;

    const bonus = currentHonba * 300;
    const info = document.getElementById('mode-info');

    if (mode === 'ron') {
        info.innerHTML = '<span class="badge badge-ron">👥 ロン (脇から)</span>';
        correctV1 = ronScores.find(s => (s + bonus) > diff) || 32000;
    } else if (mode === 'direct') {
        info.innerHTML = '<span class="badge badge-direct">🎯 直撃</span>';
        correctV1 = ronScores.find(s => ((s + bonus) * 2) > diff) || 32000;
    } else {
        const isVsOya = (mode === 'tsumo-oya');
        info.innerHTML = `<span class="badge badge-tsumo">🌊 ツモ (vs${isVsOya ? '親' : '子'})</span>`;
        const winner = tsumoScores.find(s => {
            const myGain = s.t + bonus;
            const enemyLoss = (isVsOya ? s.o : s.k) + (currentHonba * 100);
            return (myGain + enemyLoss) > diff;
        }) || {k:8000, o:16000};
        correctV1 = winner.k; correctV2 = winner.o;
    }
    data = { val1: '', val2: '' };
    setupInputUI();
}

function setupInputUI() {
    const ui = document.getElementById('input-ui');
    if (mode.startsWith('tsumo')) {
        ui.innerHTML = `<div><div class="setting-label">子</div><div id="val1" class="input-box active" onclick="switchInp('val1')">0</div></div>
                        <span style="font-size:20px; margin-top:15px;">-</span>
                        <div><div class="setting-label">親</div><div id="val2" class="input-box" onclick="switchInp('val2')">0</div></div>`;
    } else {
        ui.innerHTML = `<div id="val1" class="input-box active" onclick="switchInp('val1')">0</div><span style="margin-top:10px; font-weight:bold;">点</span>`;
    }
    activeInput = 'val1';
}

function switchInp(id) {
    activeInput = id;
    document.querySelectorAll('.input-box').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function press(k) {
    if (k === 'C') data[activeInput] = '';
    else if (k === 'B') data[activeInput] = data[activeInput].slice(0, -1);
    else if (data[activeInput].length < 5) data[activeInput] += k;
    document.getElementById(activeInput).innerText = data[activeInput] || '0';
}

function judge() {
    const v1 = parseInt(data.val1) || 0;
    const v2 = parseInt(data.val2) || 0;
    const res = document.getElementById('result-popup');
    const isTsumo = mode.startsWith('tsumo');
    const isCorrect = isTsumo ? (v1 === correctV1 && v2 === correctV2) : (v1 === correctV1);

    if (isCorrect) {
        if (!isReviewMode) { totalQuestions++; correctAnswers++; }
        res.innerHTML = `<b style="color:var(--success)">⭕ 正解！！</b>`;
    } else {
        if (!isReviewMode) totalQuestions++;
        const ans = isTsumo ? `${correctV1}-${correctV2}` : `${correctV1}点`;
        res.innerHTML = `<b style="color:var(--danger)">❌ 正解は ${ans}</b>`;
        const qData = { mode, diff, honba: currentHonba, cV1: correctV1, cV2: correctV2 };
        mistakes.push(qData);
    }
    document.getElementById('score-counter').innerText = isReviewMode ? `復習中: 残り ${mistakes.length + (isCorrect ? 0 : 0)}問` : `${correctAnswers} / ${totalQuestions}`;
    document.getElementById('post-btns').classList.remove('hidden');
    document.getElementById('judge-btn').disabled = true; document.getElementById('judge-btn').style.opacity = "0.3";
}

function nextQuestion() {
    //入力をリセット
    data = { val1: '', val2: '' };
    
    // 表示もリセット
    if (document.getElementById('val1')) document.getElementById('val1').innerText = '0';
    if (document.getElementById('val2')) document.getElementById('val2').innerText = '0';
    
    // 共通の初期化処理
    document.getElementById('post-btns').classList.add('hidden');
    document.getElementById('result-popup').innerHTML = "";
    document.getElementById('judge-btn').disabled = false;
    document.getElementById('judge-btn').style.opacity = "1";

    if (isReviewMode) {
        if (mistakes.length === 0) {
            alert("復習完了！");
            location.reload();
        } else {
            const q = mistakes.shift();
            mode = q.mode;
            diff = q.diff;
            currentHonba = q.honba;
            correctV1 = q.cV1;
            correctV2 = q.cV2;
            
            document.getElementById('score-counter').innerText = `復習中: 残り ${mistakes.length + 1}問`;
            const honbaT = currentHonba > 0 ? ` <small style="color:var(--warning)">[${currentHonba}本場]</small>` : "";
            document.getElementById('q-diff').innerHTML = `${diff.toLocaleString()}点差${honbaT}をまくれ！`;
            
            setupInputUI();
        }
    } else {
        generateProblem();
    }
}
function showFinalResult() {
    document.getElementById('result-screen').classList.remove('hidden');
    const rate = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    document.getElementById('result-stats').innerHTML = `<div style="font-size:22px; margin-bottom:10px;">正解: ${correctAnswers} / ${totalQuestions}</div><div style="font-size:24px; color:var(--success);">正解率: ${rate}%</div>`;
    if (mistakes.length === 0) document.getElementById('review-btn').classList.add('hidden');
}

function startReview() {
    isReviewMode = true; document.getElementById('result-screen').classList.add('hidden');
    nextQuestion();
}