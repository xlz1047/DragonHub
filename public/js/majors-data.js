let drexelColleges = [
    {
        college: 'College of Computing & Informatics (CCI)',
        majors: ['Computer Science', 'Software Engineering', 'Data Science', 'Information Systems']
    },
    {
        college: 'LeBow College of Business',
        majors: ['Finance', 'Marketing', 'Business Analytics', 'Accounting']
    },
    {
        college: 'College of Engineering',
        majors: ['Mechanical Engineering', 'Electrical Engineering', 'Computer Engineering', 'Biomedical Engineering', 'Chemical Engineering', 'Civil Engineering']
    },
    {
        college: 'Westphal College of Media Arts & Design',
        majors: ['Graphic Design', 'Game Design', 'Animation', 'Architecture']
    },
    {
        college: 'College of Arts & Sciences',
        majors: ['Biology', 'Chemistry', 'Psychology', 'Political Science', 'English', 'Mathematics']
    },
    {
        college: 'College of Nursing & Health Professions',
        majors: ['Nursing', 'Health Sciences', 'Nutrition Sciences']
    }
];

let allMajorsFlat = [];
for (let i = 0; i < drexelColleges.length; i++) {
    for (let j = 0; j < drexelColleges[i].majors.length; j++) {
        allMajorsFlat.push({
            major: drexelColleges[i].majors[j],
            college: drexelColleges[i].college
        });
    }
}
