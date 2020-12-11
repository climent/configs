for dir in $(ls) ; do if test -d $dir/.git; then ( echo "Updating [ $dir ] ..." ; cd $dir ; git fetch --all ; echo "---------") ; fi ; done
