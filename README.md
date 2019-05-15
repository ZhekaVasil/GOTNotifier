## **Game of Thrones notifier**

You will receive notification (SMS/Browser) once a specified episode of GoT is available on LostFilm.tv

How to use:
1. Decrypt `.env` file: `blackbox_decrypt_all_files` (see blackbox docs here https://github.com/StackExchange/blackbox#commands)
2. Provide `TARGET_PHONE_NUMBER` - you will receive SMS notification on the phone number
3. Provide episode number you are waiting for in `config.json` - `episodeNumber` value; ex: "85" - stands for `8 season 5 episode`
4. Run app `node index`
