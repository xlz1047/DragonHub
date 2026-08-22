function renderQuickPoll() {
    let container = document.getElementById('quick-poll-box');
    if (!container) {
        return;
    }

    return apiGetPolls().then(function (polls) {
        allPolls = polls;
        container.textContent = '';

        if (!polls || polls.length === 0) {
            return;
        }

        let poll = polls[0];

        let questionEl = document.createElement('p');
        questionEl.classList.add('poll-question');
        questionEl.textContent = poll.question;
        container.append(questionEl);

        let optionsBox = document.createElement('div');
        optionsBox.classList.add('poll-options');

        for (let i = 0; i < poll.options.length; i++) {
            let opt = poll.options[i];
            let pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;

            let optBtn = document.createElement('button');
            optBtn.type = 'button';
            optBtn.classList.add('poll-option-btn');

            let barEl = document.createElement('div');
            barEl.classList.add('poll-bar');
            barEl.style.width = pct + '%';

            let textEl = document.createElement('span');
            textEl.classList.add('poll-option-text');
            textEl.textContent = opt.text;

            let pctEl = document.createElement('span');
            pctEl.classList.add('poll-option-pct');
            pctEl.textContent = pct + '%';

            optBtn.append(barEl);
            optBtn.append(textEl);
            optBtn.append(pctEl);
            optBtn.addEventListener('click', function () {
                votePoll(poll.id, opt.id);
            });

            optionsBox.append(optBtn);
        }

        container.append(optionsBox);

        let footerEl = document.createElement('div');
        footerEl.classList.add('poll-vote-footer');
        footerEl.textContent = poll.totalVotes + ' Drexel votes recorded';
        container.append(footerEl);
    }).catch(function (e) {
        console.error('Failed to render poll:', e);
    });
}

function votePoll(pollId, optionId) {
    apiVotePoll(pollId, optionId).then(function (updatedPoll) {
        for (let i = 0; i < allPolls.length; i++) {
            if (allPolls[i].id === pollId) {
                allPolls[i] = updatedPoll;
                break;
            }
        }
        loadHeaderUser();
        if (document.getElementById('quick-poll-box')) {
            renderQuickPoll();
        }
        if (document.getElementById('polls-list')) {
            renderPollsList();
        }
    }).catch(function (e) {
        console.error('Failed to vote on poll:', e);
    });
}

function renderPollsList() {
    let container = document.getElementById('polls-list');
    if (!container) {
        return;
    }

    return apiGetPolls().then(function (polls) {
        allPolls = polls;
        container.textContent = '';

        if (!polls || polls.length === 0) {
            let emptyCard = document.createElement('div');
            emptyCard.classList.add('card', 'poll-list-empty');
            emptyCard.textContent = 'No polls yet. Be the first to create one!';
            container.append(emptyCard);
            return;
        }

        for (let i = 0; i < polls.length; i++) {
            let pollCard = buildPollCardElement(polls[i]);
            container.append(pollCard);
        }
    }).catch(function (e) {
        console.error('Failed to render polls list:', e);
    });
}

function buildPollCardElement(poll) {
    let pollCard = document.createElement('div');
    pollCard.classList.add('card');

    let topRow = document.createElement('div');
    topRow.classList.add('poll-card-top');

    let questionEl = document.createElement('h4');
    questionEl.classList.add('poll-card-question');
    questionEl.textContent = poll.question;

    let categoryEl = document.createElement('span');
    categoryEl.classList.add('poll-card-category');
    categoryEl.textContent = poll.category || 'Campus';

    topRow.append(questionEl);
    topRow.append(categoryEl);
    pollCard.append(topRow);

    let optionsBox = document.createElement('div');
    optionsBox.classList.add('poll-options');

    for (let j = 0; j < poll.options.length; j++) {
        let opt = poll.options[j];
        let pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;

        let optBtn = document.createElement('button');
        optBtn.type = 'button';
        optBtn.classList.add('poll-option-btn');

        let barEl = document.createElement('div');
        barEl.classList.add('poll-bar');
        barEl.style.width = pct + '%';

        let textEl = document.createElement('span');
        textEl.classList.add('poll-option-text');
        textEl.textContent = opt.text;

        let pctEl = document.createElement('span');
        pctEl.classList.add('poll-option-pct');
        pctEl.textContent = pct + '%';

        optBtn.append(barEl);
        optBtn.append(textEl);
        optBtn.append(pctEl);
        optBtn.addEventListener('click', function () {
            votePoll(poll.id, opt.id);
        });

        optionsBox.append(optBtn);
    }

    pollCard.append(optionsBox);

    let footerEl = document.createElement('div');
    footerEl.classList.add('poll-card-footer');

    let byEl = document.createElement('span');
    byEl.textContent = 'By ' + poll.authorName;

    let votesEl = document.createElement('span');
    votesEl.textContent = poll.totalVotes + ' votes';

    footerEl.append(byEl);
    footerEl.append(votesEl);
    pollCard.append(footerEl);

    return pollCard;
}

function handlePollSubmit(e) {
    e.preventDefault();
    let question = document.getElementById('poll-question-input').value;
    let category = document.getElementById('poll-category-input').value;
    let optInputs = document.querySelectorAll('.poll-opt-input');
    let options = [];
    for (let i = 0; i < optInputs.length; i++) {
        if (optInputs[i].value.trim()) {
            options.push(optInputs[i].value.trim());
        }
    }

    apiCreatePoll({
        question: question,
        category: category,
        options: options
    }).then(function (newPoll) {
        closeModal('poll-modal');
        if (document.getElementById('polls-list')) {
            renderPollsList();
        }
        loadHeaderUser();
    }).catch(function (e) {
        console.error('Failed to create poll:', e);
    });
}

function bindPollEvents() {
    let pollForm = document.getElementById('poll-form');
    if (pollForm) {
        pollForm.addEventListener('submit', function (e) {
            handlePollSubmit(e);
        });
    }
}
