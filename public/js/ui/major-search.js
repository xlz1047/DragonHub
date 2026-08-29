function setupMajorSearchDropdown(inputId, dropdownId) {
    let input = document.getElementById(inputId);
    let dropdown = document.getElementById(dropdownId);

    if (!input || !dropdown) {
        return;
    }

    function renderMajorOptions(query) {
        dropdown.textContent = '';
        let lowerQuery = query.toLowerCase().trim();

        let matches = allMajorsFlat.filter(function (entry) {
            return entry.major.toLowerCase().includes(lowerQuery) ||
                entry.college.toLowerCase().includes(lowerQuery);
        });

        if (matches.length === 0) {
            dropdown.classList.add('hidden');
            return;
        }

        for (let i = 0; i < matches.length; i++) {
            let entry = matches[i];

            let optionEl = document.createElement('div');
            optionEl.classList.add('major-option');

            let majorNameEl = document.createElement('span');
            majorNameEl.classList.add('major-option-name');
            majorNameEl.textContent = entry.major;

            let collegeNameEl = document.createElement('span');
            collegeNameEl.classList.add('major-option-college');
            collegeNameEl.textContent = entry.college;

            optionEl.append(majorNameEl);
            optionEl.append(collegeNameEl);

            optionEl.addEventListener('mousedown', function (e) {
                e.preventDefault();
                input.value = entry.major;
                input.setAttribute('data-selected-college', entry.college);
                dropdown.textContent = '';
                dropdown.classList.add('hidden');
            });

            dropdown.append(optionEl);
        }

        dropdown.classList.remove('hidden');
    }

    input.addEventListener('focus', function () {
        renderMajorOptions(input.value);
    });

    input.addEventListener('input', function () {
        renderMajorOptions(input.value);
    });

    document.addEventListener('click', function (e) {
        if (e.target !== input && e.target !== dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
}
