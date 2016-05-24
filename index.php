<!DOCTYPE html>
<html>

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
  <meta name="description" content="3D Playground">

  <title>Portfolio</title>

  <link rel="icon" type="image/png" href="favicon.png" />
  <link rel="stylesheet" type="text/css" href="styles/main.css" />
  <!--
    <link href='https://fonts.googleapis.com/css?family=Roboto:400,700,900' rel='stylesheet' type='text/css'>
    <script src="//cdn.jsdelivr.net/lodash/4.6.1/lodash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.2/TweenMax.min.js"></script>
    -->

  <script src="node_modules/whatwg-fetch/fetch.js"></script>
  <script src="node_modules/three/three.js"></script>

  <script src="scripts/vendor/three/js/shaders/BleachBypassShader.js"></script>
  <script src="scripts/vendor/three/js/shaders/ColorifyShader.js"></script>
  <script src="scripts/vendor/three/js/shaders/ConvolutionShader.js"></script>
  <script src="scripts/vendor/three/js/shaders/CopyShader.js"></script>
  <script src="scripts/vendor/three/js/shaders/DotScreenShader.js"></script>
  <script src="scripts/vendor/three/js/shaders/FilmShader.js"></script>
  <script src="scripts/vendor/three/js/shaders/HorizontalBlurShader.js"></script>
  <script src="scripts/vendor/three/js/shaders/SepiaShader.js"></script>
  <script src="scripts/vendor/three/js/shaders/VerticalBlurShader.js"></script>
  <script src="scripts/vendor/three/js/shaders/VignetteShader.js"></script>

  <script src="scripts/vendor/three/js/postprocessing/EffectComposer.js"></script>
  <script src="scripts/vendor/three/js/postprocessing/RenderPass.js"></script>
  <script src="scripts/vendor/three/js/postprocessing/BloomPass.js"></script>
  <script src="scripts/vendor/three/js/postprocessing/FilmPass.js"></script>
  <script src="scripts/vendor/three/js/postprocessing/DotScreenPass.js"></script>
  <script src="scripts/vendor/three/js/postprocessing/TexturePass.js"></script>
  <script src="scripts/vendor/three/js/postprocessing/ShaderPass.js"></script>
  <script src="scripts/vendor/three/js/postprocessing/MaskPass.js"></script>

  <script src="scripts/vendor/threex.domevents.js"></script>
  <script src="scripts/vendor/three/js/Detector.js"></script>
  <script src="scripts/vendor/three/js/libs/stats.min.js"></script>

</head>

<body>

  <div id="centreCircle" class="circle">
    <div id="centreCircleContents" class="wrapcontent"></div>
  </div>

</body>

<script src="scripts/main.js"></script>

</html>
