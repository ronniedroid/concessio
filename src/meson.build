concessio_sources += files(
  'main.vala',
  'application.vala',
  'window.vala',
  'help_dialog.vala',
  'permissions.vala',
  'umask.vala'
)

concessio_deps = [
  config_dep,
  dependency('glib-2.0'),
  dependency('gio-2.0'),
  dependency('gobject-2.0'),
  dependency('gtk4'),
  dependency('libadwaita-1', version: '>= 1.4'),
  dependency('gee-0.8'),
]

blueprints = custom_target('blueprints',
  input: files(
    'shortcuts-dialog.blp',
    'help-dialog.blp',
    'window.blp',
    'permissions.blp',
    'umask.blp',
  ),
  output: '.',
  command: [find_program('blueprint-compiler'), 'batch-compile', '@OUTPUT@', '@CURRENT_SOURCE_DIR@', '@INPUT@'],
)

# Compile the resources
concessio_sources += gnome.compile_resources(
	'io.github.ronniedroid.concessio',
	'io.github.ronniedroid.concessio.src.gresource.xml',
	c_name: 'concessio',
	dependencies: blueprints,
)

executable('concessio', concessio_sources,
  dependencies: concessio_deps,
  include_directories: config_inc,
  install: true,
)

