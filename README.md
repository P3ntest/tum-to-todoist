# GoCast Lecture Fetcher (For [TUM](https://tum.de/))

This is a hobby project script written in TypeScript that runs in the Bun runtime. The script fetches all pinned lectures on the [GoCast](https://github.com/TUM-Dev/gocast) live streaming service of your university (https://live.rbg.tum.de/) and adds the lectures you haven't watched to your Todoist todo list using the Todoist API.

## Configuration

### Environment Variables

```.env
TODOIST_API_KEY=your todoist api key (todoist => settings => integrations => developer)
PROJECT_NAME="My Todoist Project"
SECTION_NAME="Todoist Section inside Project" (Optional)
GOCAST_COOKIE=your gocast cookie (starts with "jwt=")
CRON="10 8-20 * * 1-5" # Cron expression for when to run the script (every hour between 8am and 8pm on weekdays)
```

### In Todoist

Make sure to have the project (and section, if specified) created in Todoist before running the script. The script will not create the project or section for you.

### In GoCast

Make sure to "Pin" all lectures you want to watch in GoCast. The script will only add lectures to your Todoist that are pinned.

## Running

### Running with Docker (recommended)

```bash
docker pull p3ntest/tumtotodoist:latest
docker run -d --restart always --name tumtotodoist -v /path/to/your/config.env:/app/.env p3ntest/tumtotodoist:latest
```

### Running with bun locally

```bash
bun run src/index.ts
```

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code as per the terms of the license.

## Contact

Feel free to reach out to me via E-Mail [here](mailto:julius@vanvoorden.dev)
