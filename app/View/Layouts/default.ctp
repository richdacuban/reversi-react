<?php
	/**
	 *
	 * PHP 5
	 *
	 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
	 * Copyright 2005-2012, Cake Software Foundation, Inc. (http://cakefoundation.org)
	 *
	 * Licensed under The MIT License
	 * Redistributions of files must retain the above copyright notice.
	 *
	 * @copyright     Copyright 2005-2012, Cake Software Foundation, Inc. (http://cakefoundation.org)
	 * @link          http://cakephp.org CakePHP(tm) Project
	 * @package       Cake.View.Layouts
	 * @since         CakePHP(tm) v 0.10.0.1076
	 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
	 */
	$cakeDescription = __d('cake_dev', 'CakePHP: the rapid development php framework');
?>

<!DOCTYPE html>
<head lang="en">
	<?php echo $this->Html->charset(); ?>
	<title>
		Parker Bossier
		<?php if (isset($subtitle_for_layout)) echo ' | ' . @$subtitle_for_layout; ?>
	</title>
	<?php
		echo $this->Html->meta('icon');
		echo $this->fetch('meta');

		echo $this->Html->css('bootstrap');
		echo $this->Html->css('main');
		echo $this->Html->css('bootstrap-responsive');
		echo $this->fetch('css');

		echo $this->Html->script('jquery-1.7.2');
		echo $this->Html->script('bootstrap.min');

		// tab selected
		if (isset($active_tab_for_layout)) {
			?>
			<!-- selects the correct tab -->
			<script type="text/javascript">
				$(function() {
					var active_tab = '<?php echo $active_tab_for_layout; ?>';
					$('.nav-tabs [data-name="' + active_tab + '"]').parent().addClass('active');
					console.log('.nav-tabs [data-name="' + active_tab + '"]');
				});
			</script>
			<?php
		}

		echo $this->fetch('script');
	?>
</head>

<body>
	<div class="navbar navbar-fixed-top">
		<div class="navbar-inner">
			<div class="container container-bypass">
				<a class="brand" href="/">Parker Bossier</a>

				<ul class="nav nav-tabs navbar-fixed-top">
					<li><a href="/projects/web" data-name="web">Web</a></li>
					<li><a href="/projects/ios" data-name="ios">iOS</a></li>
					<li><a href="/projects/processing" data-name="processing">Processing</a></li>
					<li><a href="/projects/matlab" data-name="matlab">Stereopsis (Matlab)</a></li>
					<li><a href="/projects/flash" data-name="flash">Flash</a></li>
					<li><a href="mailto:parkerbossier@gmail.com" _target="_blank">
							Contact</a></li>
					<li><a href="/pdfs/Parker%20Bossier.pdf" target="_blank">Resume</a></li>
				</ul>
			</div>
		</div>
	</div>

	<?php echo $this->fetch('content'); ?>
</body>
</html>