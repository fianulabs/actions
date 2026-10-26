const { cliUrl, resolveVersion } = require('./setup-fianu');

describe('cliUrl', () => {
    test.each([
        ['1.2.2', 'linux', 'amd64', 'https://storage.googleapis.com/fianu-release/1.2.2/fianu'],
        ['1.9.40', 'linux', 'amd64', 'https://storage.googleapis.com/fianu-release/1.9.40/dist/cli_linux_amd64_v1/cli'],
        ['1.9.75', 'linux', 'amd64', 'https://storage.googleapis.com/fianu-release-v1/fianucli/1.9.75/dist/cli_linux_amd64_v1/cli'],
        ['1.9.76', 'linux', 'amd64', 'https://releases.fianu.io/fianucli/1.9.76/dist/cli_linux_amd64_v1/cli'],
        ['1.10.45', 'linux', 'arm64', 'https://releases.fianu.io/fianucli/1.10.45/dist/cli_linux_arm64/cli'],
        ['1.10.45', 'windows', 'amd64', 'https://releases.fianu.io/fianucli/1.10.45/dist/cli_windows_amd64_v1/cli.exe'],
        // existing darwin -> amd64_v1 behavior is kept
        ['1.10.45', 'darwin', 'arm64', 'https://releases.fianu.io/fianucli/1.10.45/dist/cli_darwin_amd64_v1/cli'],
        ['v1.10.45', 'linux', 'amd64', 'https://releases.fianu.io/fianucli/1.10.45/dist/cli_linux_amd64_v1/cli'],
    ])('cliUrl(%s, %s, %s)', (version, platform, arch, expected) => {
        expect(cliUrl(version, platform, arch)).toBe(expected);
    });
});

describe('resolveVersion', () => {
    const POINTER = 'https://releases.fianu.io/fianucli/channels/latest';

    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('pinned version is returned without fetching', async () => {
        await expect(resolveVersion('1.10.44')).resolves.toBe('1.10.44');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('leading v is stripped', async () => {
        await expect(resolveVersion('v1.10.44')).resolves.toBe('1.10.44');
    });

    test('latest resolves through the pointer file', async () => {
        global.fetch.mockResolvedValue({ ok: true, text: async () => '1.10.45\n' });
        await expect(resolveVersion('latest')).resolves.toBe('1.10.45');
        expect(global.fetch).toHaveBeenCalledWith(POINTER);
    });

    test('latest is case-insensitive', async () => {
        global.fetch.mockResolvedValue({ ok: true, text: async () => '1.10.45\n' });
        await expect(resolveVersion('Latest')).resolves.toBe('1.10.45');
    });

    test('pointer 404 is a hard failure naming the URL and status', async () => {
        global.fetch.mockResolvedValue({ ok: false, status: 404 });
        await expect(resolveVersion('latest')).rejects.toThrow(/channels\/latest.*404/);
    });

    test('empty pointer body is a hard failure naming the URL', async () => {
        global.fetch.mockResolvedValue({ ok: true, text: async () => '\n' });
        await expect(resolveVersion('latest')).rejects.toThrow(/channels\/latest/);
    });

    test('non-version pointer body is a hard failure naming the URL', async () => {
        global.fetch.mockResolvedValue({ ok: true, text: async () => '<html>oops</html>' });
        await expect(resolveVersion('latest')).rejects.toThrow(/channels\/latest/);
    });

    test('network error is a hard failure naming the URL', async () => {
        global.fetch.mockRejectedValue(new Error('boom'));
        await expect(resolveVersion('latest')).rejects.toThrow(/channels\/latest/);
    });
});
