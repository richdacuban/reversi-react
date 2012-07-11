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
	 * @copyright	 Copyright 2005-2012, Cake Software Foundation, Inc. (http://cakefoundation.org)
	 * @link		  http://cakephp.org CakePHP(tm) Project
	 * @package	   Cake.View.Layouts
	 * @since		 CakePHP(tm) v 0.10.0.1076
	 * @license	   MIT License (http://www.opensource.org/licenses/mit-license.php)
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

	<meta name="viewport" content="width = device-width">
	<meta name = "viewport" content = "initial-scale = 1.0">

	<?php
		echo $this->Html->meta('icon');
		echo $this->fetch('meta');

		echo $this->Html->css('bootstrap');
		echo $this->Html->css('main');
		echo $this->Html->css('bootstrap-responsive');
		echo $this->Html->css('responsive-customizations');
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
			<div class="container my-bypass">
				<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</a>

				<a class="brand" href="/">Parker Bossier</a>

				<div class="nav-collapse">
					<ul class="nav nav-tabs">
						<li><a href="/" data-name="home">Home</a></li>

						<li class="divider-vertical"></li>

						<li><a href="/projects/web" data-name="web">Web</a></li>
						<li><a href="/projects/ios" data-name="ios">iOS</a></li>
						<li><a href="/projects/sphere" data-name="sphere">Sphere (Processing)</a></li>
						<li><a href="/projects/stereopsis" data-name="stereopsis">Stereopsis (Matlab)</a></li>
						<li><a href="/projects/flash" data-name="flash">Flash</a></li>

						<li class="divider-vertical"></li>

						<li><a href="mailto:parkerbossier@gmail.com" target="_blank">Contact</a></li>
						<li><a href="/pdfs/Parker%20Bossier.pdf" target="_blank">Resume</a></li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<?php echo $this->fetch('content'); ?>
</body>
</html>