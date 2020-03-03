
def isValueADate(value):
    try:
        return value[4] == '-' and value[7] == '-' and value[10] == 'T' and value[13] == ':' and value[16] == ':' and value[19] == 'Z'
    except:
        return False
        
def parseDate(date_string):
    day   = date_string[8:10]
    month = date_string[5:7]
    year  = date_string[0:4]

    if (day[0] == '0'): 
        day = day[1:2]
    
    months = {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December'
    }

    if month in months:
       month = months[month]
    else:
        month = ' '

    return day, month, year

