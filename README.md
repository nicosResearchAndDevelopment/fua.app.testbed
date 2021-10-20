# nrd-testbed

## Documentation

[here](./documentation/)

### Installation Guides

[here](./documentation/install/)

## etc hosts

| ec  | FQDN                     | ip        | port | description |
|:--- |:---                      |:---       |:---  |:---         |
|     | testbed.nicos-rd.com     | 127.0.0.1 | 8080 |  |
|     | testsuite.nicos-rd.com   | 127.0.0.1 | 8081 |  |
| ids | nrd-daps.nicos-rd.com    | 127.0.0.1 | 8082 |  |
| ids | omejdn-daps.nicos-rd.com | 127.0.0.1 | 4567 |  |
| ids | mdb-fh.nicos-rd.com      | 127.0.0.1 |      |  |
| ids | paris-fh.nicos-rd.com    | 127.0.0.1 |      |  |
| ids | nrd-ch.nicos-rd.com      | 127.0.0.1 |      |  |
| ids | nrd-dtm.nicos-rd.com     | 127.0.0.1 |      |  |
| ids | alice.nicos-rd.com       | 127.0.0.1 | 8099 |  |
| ids | bob.nicos-rd.com         | 127.0.0.1 | 8098 |  |
| ids | **SUT**                  |           |      |  |
| ids | gbx.nicos-rd.com         | 127.0.0.1 | 8090 |  |
| ids | ids-dsc.nicos-rd.com     | 127.0.0.1 | 8091 |  |
||||||

```
#region GBX-TF

##region tb

# testbed
## port 8080
127.0.0.1 testbed.nicos-rd.com

# testsuite
## port 8081
127.0.0.1 testsuite.nicos-rd.com

##region tb.ec
##region tb.ec.ids

# nrd-DAPS
## port 8082
127.0.0.1 nrd-daps.nicos-rd.com

# omejdn-DAPS
## port 4567
127.0.0.1 omejdn-daps.nicos-rd.com

# ALICE
## port 8099
127.0.0.1 alice.nicos-rd.com

# BOB
## port 8098
127.0.0.1 bob.nicos-rd.com

##region tb.ec.ids.applicant

# GAIAboX
## port 8090
127.0.0.1 gbx.nicos-rd.com

# Data Space Connector
## port 8091
127.0.0.1 ids-dsc.nicos-rd.com

##endregion tb.ec.ids.applicant

##endregion tb.ec.ids
##endregion tb.ec
##endregion tb

#endregion GBX-TF
```

## See Also

- [Fh Fokus, ids-certification testing](https://gitlab.cc-asp.fraunhofer.de/ksa/ids-certification-testing)

---

