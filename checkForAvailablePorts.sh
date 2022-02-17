for port in {3000..4000}; do if ! grep -q $port service-names-port-numbers.csv; then echo $port;fi; done;
