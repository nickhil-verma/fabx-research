import {Args, Command, Flags} from '@oclif/core';
import {
  runAnsibleTarget,
  SUPPORTED_ANSIBLE_TARGETS,
  SUPPORTED_TARGET_GROUPS,
  type AnsibleTarget,
} from '../lib/ansible';

export default class Ansible extends Command {
  static description = 'Run Fabric-X Ansible collection workflows through Fabx CLI';

  static examples = [
    '<%= config.bin %> <%= command.id %> setup --collection-path ../fabric-x-ansible-collection',
    '<%= config.bin %> <%= command.id %> start --group fabric_x',
    '<%= config.bin %> <%= command.id %> login-cr --container-registry icr.io --container-registry-username iamapikey --container-registry-password $TOKEN',
    '<%= config.bin %> <%= command.id %> run-command --target-hosts fabric_x_committer --remote-command "docker ps -a"',
    '<%= config.bin %> <%= command.id %> limit-rate --limit 2000',
    '<%= config.bin %> <%= command.id %> help --dry-run',
  ];

  static args = {
    target: Args.string({
      description: `Makefile target to run: ${SUPPORTED_ANSIBLE_TARGETS.join(', ')}`,
      options: [...SUPPORTED_ANSIBLE_TARGETS],
      required: true,
    }),
  };

  static flags = {
    'ansible-config': Flags.string({
      description: 'Override ANSIBLE_CONFIG for the collection command',
    }),
    'assert-metrics': Flags.boolean({
      default: false,
      description: 'Set ASSERT_METRICS=true when supported by the target',
    }),
    'collection-path': Flags.string({
      char: 'c',
      description: 'Path to the fabric-x-ansible-collection checkout or installed collection root',
    }),
    'container-registry': Flags.string({
      description: 'Container registry hostname for login-cr',
    }),
    'container-registry-password': Flags.string({
      description: 'Container registry password for login-cr',
    }),
    'container-registry-username': Flags.string({
      description: 'Container registry username for login-cr',
    }),
    'dry-run': Flags.boolean({
      default: false,
      description: 'Print the resolved make command and environment without executing it',
    }),
    group: Flags.string({
      description: `Optional group prefix, mirroring "make <group> <target>": ${SUPPORTED_TARGET_GROUPS.join(', ')}`,
      options: [...SUPPORTED_TARGET_GROUPS],
    }),
    limit: Flags.integer({
      description: 'Value forwarded as LIMIT, used by targets like limit-rate',
    }),
    'remote-command': Flags.string({
      description: 'Command payload for the run-command target',
    }),
    'target-hosts': Flags.string({
      default: 'all',
      description: 'Value forwarded as TARGET_HOSTS',
    }),
    'use-venv': Flags.boolean({
      allowNo: true,
      default: true,
      description: 'Use the collection virtualenv-backed Ansible commands',
    }),
    'extra-make-arg': Flags.string({
      description: 'Additional raw argument passed to make after the target',
      multiple: true,
    }),
  };

  async run(): Promise<void> {
    try {
      const {args, flags} = await this.parse(Ansible);
      const target = args.target as AnsibleTarget;

      if (target === 'run-command' && !flags['remote-command']) {
        this.error('`fabx ansible run-command` requires `--remote-command`.');
        return;
      }

      if (target === 'login-cr') {
        const missing = [
          !flags['container-registry'] ? '--container-registry' : '',
          !flags['container-registry-username'] ? '--container-registry-username' : '',
          !flags['container-registry-password'] ? '--container-registry-password' : '',
        ].filter(Boolean);

        if (missing.length > 0) {
          this.error(`\`fabx ansible login-cr\` requires ${missing.join(', ')}.`);
          return;
        }
      }

      const result = runAnsibleTarget({
        ansibleConfig: flags['ansible-config'],
        assertMetrics: flags['assert-metrics'],
        collectionPath: flags['collection-path'],
        containerRegistry: flags['container-registry'],
        containerRegistryPassword: flags['container-registry-password'],
        containerRegistryUsername: flags['container-registry-username'],
        dryRun: flags['dry-run'],
        extraMakeArgs: flags['extra-make-arg'],
        group: flags.group,
        limit: flags.limit,
        remoteCommand: flags['remote-command'],
        target,
        targetHosts: flags['target-hosts'],
        useVenv: flags['use-venv'],
      });

      if (flags['dry-run']) {
        this.log(`Collection path: ${result.collectionPath}`);
        this.log(`Command: ${result.command}`);
        if (flags['target-hosts']) {
          this.log(`TARGET_HOSTS=${flags['target-hosts']}`);
        }
        if (typeof flags.limit === 'number') {
          this.log(`LIMIT=${flags.limit}`);
        }
        if (flags['remote-command']) {
          this.log(`COMMAND=${flags['remote-command']}`);
        }
        return;
      }

      this.log(`Completed: ${result.command}`);
    } catch (err: any) {
      this.error(err.message);
    }
  }
}
