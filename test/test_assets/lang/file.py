logfile = open("/var/log/syslog", "r")
for line in logfile:
    line_split = line.split()
    print line_split
    #Comment
    list = line_split[0], line_split[1], line_split[2], line_split[4]
    """
    Multi-line
    comment
    """
    print list
