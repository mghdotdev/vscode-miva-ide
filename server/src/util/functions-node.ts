import { SpawnOptionsWithoutStdio, spawn } from 'child_process';

export function asyncSpawn (command: string, args?: readonly string[], options?: SpawnOptionsWithoutStdio): Promise<{stdout: string, stderr: string}> {
	return new Promise((resolve, reject) => {
		let stdout = '';
		let stderr = '';

		const cmd = spawn(
			command,
			args,
			options
		);

		cmd.stdout.on('data', data => {
			stdout += data.toString();
		});

		cmd.stderr.on('data', data => {
			stderr += data.toString();
		});

		cmd.on('close', () => {
			resolve({
				stdout,
				stderr,
			});
		});
	});
}