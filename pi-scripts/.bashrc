# ...

# goes at END
# if we're NOT using SSH, then start x
if [ -z "$SSH_CLIENT" ]
then
  # run our python script, then fork it, like:
  # python3 our_script.py &
  startx
fi
