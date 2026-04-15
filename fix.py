content = open('app.py').read()
content = content.replace("    for msg in st.session_state.messages:\n        with st.chat_message(\"user\"):", "        with st.chat_message(\"user\"):")
content = content.replace("    for msg in st.session_state.messages:\n        with st.chat_message(\"assistant\"):", "        with st.chat_message(\"assistant\"):")
open('app.py', 'w').write(content)
