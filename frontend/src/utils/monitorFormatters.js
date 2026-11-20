import { faCloud, faCloudSun, faSnowflake, faSun } from '@fortawesome/free-solid-svg-icons';

export function formatGermanMonitorDate() {
    const now = new Date();
    const formattedGermanDate = new Intl.DateTimeFormat('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour12: false,
    })
        .format(now)
        .split(' ');

    return [
        formattedGermanDate[0].substring(0, formattedGermanDate[0].length - 1),
        formattedGermanDate[1].substring(0, formattedGermanDate[1].length - 1),
        formattedGermanDate[2],
        formattedGermanDate[3],
    ];
}

export const formatTeacherName = (fullName) => {
    const teacherTemp = fullName.split(' ');
    const teacher = teacherTemp[0] + ' ' + teacherTemp[1][0] + '.';
    return teacher;
};

export const formatCourseFormat = (peopleQuantityString) => {
    try {
        const temp = peopleQuantityString.split(' ');
        if (Number(temp[0]) > 1)
            return ['Gruppenkurs', temp[0]];
        return ['Einzelkurs', '1'];
    } catch (error) {
        return ['None', -1];
    }
};

export const formatBigMonitorEvents = (events) => {
    let res = [];
    for (let i = 0; i < events.length; i++) {
        try {
            const temp = events[i].title.split(' - ');
            const teacher = formatTeacherName(temp[0]);
            const title = temp[1];
            const courseFormat = formatCourseFormat(temp[3])[0];
            const peopleQuantity = formatCourseFormat(temp[3])[1];
            const time = new Date(events[i].start)
                .toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                })
                .replace(':', '.');
            res.push({
                id: events[i].id,
                teacher: teacher,
                title: title,
                courseFormat: courseFormat,
                peopleQuantity: peopleQuantity,
                room: events[i].room,
                time: time,
            });
        } catch (error) {
            console.error(error);
            res.push(events[i]);
        }
    }
    return res;
};

export const buildFormattedMonitorEventData = (event, freeTime, weatherData, currentDateTime) => {
    const title = event.title.split(' - ');
    const weatherArray = weatherData.hourly.temperature_2m.sort();
    const weatherNow = Math.ceil(weatherData.hourly.temperature_2m[currentDateTime.getHours() - 1]);
    const weatherLowest = Math.ceil(weatherArray[0]);
    const weatherHighest = Math.ceil(weatherArray[23]);
    let weatherIcon = faCloudSun;

    if (weatherNow > 25) {
        weatherIcon = faSun;
    } else if (weatherNow < 5) {
        weatherIcon = faSnowflake;
    } else if (weatherNow < 15 && weatherNow > 5) {
        weatherIcon = faCloud;
    }

    return {
        teacher: title[0],
        title: `${title[1]} ${title[2]}`,
        room: event.room,
        start: new Date(event.start).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }),
        end: new Date(event.end).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }),
        freeTimeStart: new Date(freeTime.free_time_start).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }),
        freeTimeEnd: new Date(freeTime.free_time_end).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }),
        weatherNow: weatherNow,
        weatherLowest: weatherLowest,
        weatherHighest: weatherHighest,
        weatherIcon: weatherIcon,
    };
};
