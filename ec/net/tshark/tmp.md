
# [https://www.wireshark.org/docs/man-pages/tshark.html](https://www.wireshark.org/docs/man-pages/tshark.html)


JLA : 10.10.70.83

tshark -i Ethernet "ip.addr == 10.10.70.83" 
tshark -i Ethernet -f "tcp port 8080 or port 8081" -e ip.src -e ip.dst -t ad -Tjson
tshark -i Ethernet -f "http port 8080 or port 8081" -e ip.src -e ip.dst -t ad -Tjson

tshark -i Ethernet -f "host 10.10.70.83 and (port 8080 or port 8081)" -e ip.src -e ip.dst -t ad -Tjson

# tcp portrange 1501-1549

tshark -i Ethernet -f "tcp portrange 8080-8099" -e ip.src -e ip.dst -t ad -Tjson