---
title: "Calculus III"
description: "Notes on Calculus III"
pubDate: "2026-02-08"
heroImage: "jsc2026e407303~orig.jpg"
tags: ["Math", "Calculus"]
category: "Study"
---

## Fundamentals

### Vectors in 3D

$v=<x,y,z>$

Magnitude $|v|=\sqrt{x^2+y^2+z^2}$

### Dot Product of 3D Vectors

The result is a scalar.

Given $v_1=<x_1,y_1,z_1>$, $v_2=<x_2,y_2,z_2>$

Their dot product:

$$
v_1\cdot v_2=x_1x_2+y_1y_2+z_1z_2=|v_1||v_2|cos\theta
$$

If $v_1 \cdot v_2=0$, then $v_1 \perp v_2$

$cos\theta=\frac{a\cdot b}{|a||b|}$

### Cross Product of 3D Vectors

The result is a vector.

Given $v_1=<x_1,y_1,z_1>$, $v_2=<x_2,y_2,z_2>$

Their cross product:

$$
v_1 \times v_2=\det \left | \begin{matrix}
    i & j & k \\
    x_1 & y_1 & z_1 \\
    x_2 & y_2 & z_2 \\
\end{matrix} \right |=(y_1z_2-y_2z_1)i-(x_1z_2-x_2z_1)j+(x_1y_2-x_2y_1)k
$$

$$
|v_1 \times v_2|=|v_1||v_2|sin\theta
$$

The direction follows the right-hand rule: curl your fingers from $v_1$ toward $v_2$, and your thumb points in the direction of the cross product.

It produces a vector perpendicular to both $v_1$ and $v_2$, and $|a \times b| =$ the area of the parallelogram with a and b as adjacent sides.

### Lines and Planes in Space

**Line in space**: one point and one vector

Given a point in space and a vector $r_0=(x_0,y_0,z_0),\vec v_0 = <a,b,c>$

the line is $r = r_0+\lambda \vec v_0, \lambda \in \R$

or, in parametric form:

$\begin{array}{l}
    x&= x_0+\lambda a \\
    y&=y_0+\lambda b \\
    z&=z_0+\lambda c \\
\end{array}$

**Plane in space**: one point and one normal vector
Given a normal vector $n=<a,b,c>$ and a point $P_0(x_0,y_0,z_0)$ on the plane,

every point $P$ on the plane satisfies $n\cdot \vec {PP_0}=0$

Expanded: $a(x-x_0)+b(y-y_0)+c(z-z_0)=0$

which gives the standard form: $ax+by+cz=d,d=ax_0+by_0+cz_0$

### Quadric Surfaces

#### Spheres and Ellipsoids

$x^2+y^2+z^2=R^2$ (sphere)

$\frac{x^2}{a^2}+\frac{y^2}{b^2}+\frac{z^2}{c^2}=1$ (ellipsoid)

#### Cylinders

$x^2+y^2=C$

#### Paraboloids

$z=x^2+y^2$ (opens upward)

$z=C-x^2-y^2$ (opens downward)

#### Cones

$z=\sqrt{x^2+y^2}$ or $z^2=x^2+y^2$

## Vector Functions

Definition: $\vec{r}(t) = \langle X(t), Y(t), Z(t) \rangle$.

Geometric meaning: as $t$ varies, the trajectory traces a curve in space, i.e. a space curve.

Example: the helix $\vec{r}(t) = \langle \cos t, \sin t, t \rangle$.

### Derivatives and Physical Meaning

Derivative: $\vec{r}'(t) = \langle X'(t), Y'(t), Z'(t) \rangle$.

Tangent vector: $\vec{r}'(t)$ is called the tangent vector.

Velocity and speed: if $\vec{r}(t)$ represents position, then $\vec{r}'(t)$ is the velocity vector. Its direction is tangent to the curve, and its magnitude $|\vec{r}'(t)|$ is the speed.

### Arc Length and Curvature

#### Arc Length

The length from $t=a$ to $t=b$ is $L = \int_{a}^{b} |\vec{r}'(t)| dt$.

#### Curvature ($\kappa$)

Describes how sharply a curve bends.

Definition: the rate at which the direction of the unit tangent vector changes with respect to arc length.

Practical formula: $\kappa(t) = \frac{|\vec{r}'(t) \times \vec{r}''(t)|}{|\vec{r}'(t)|^3}$

Radius of curvature ($R$): defined as $R = \frac{1}{\kappa}$.

### The TNB Frame

Made up of the unit tangent vector $\vec{T}$, the unit normal vector $\vec{N}$ and the binormal vector $\vec{B}$:

Unit tangent vector: $\vec{T}(t) = \frac{\vec{r}'(t)}{|\vec{r}'(t)|}$.

Unit normal vector: $\vec{N}(t) = \frac{\vec{T}'(t)}{|\vec{T}'(t)|}$.

Binormal vector: $\vec{B}(t) = \vec{T}(t) \times \vec{N}(t)$.

## Functions of Several Variables

A function of two variables $z = f(x, y)$

Domain: usually a region in the $xy$-plane.

Level curves: the curves obtained by setting $f(x, y) = c$ ($c$ a constant). Physically, it is like slicing a mountain horizontally.

## Limits and Continuity

Condition for a limit to exist: the limit must be the same along every path approaching $(x_0, y_0)$.

To show a limit does not exist, find different paths:

- Path 1: set $y = b$ and let $x \to a$.
- Path 2: set $x = a$ and let $y \to b$.
- Path 3: set $y = kx$; if the result depends on $k$, the limit does not exist.
- Path 4: set $y = x^2$ and so on (when the degrees don't match).

Continuity: if $\lim_{(x,y) \to (a,b)} f(x, y) = f(a, b)$, the function is continuous at $(a, b)$.

## Partial Derivatives and Differentials

### Partial Derivatives

Rule: when differentiating with respect to $x$, treat $y$ as a constant, and vice versa.

Example:

$f(x, y) = x^3 + xy^3 - 2y^2$

$f_x = 3x^2 + y^3$

$f_y = 3xy^2 - 4y$

### Tangent Planes and Linear Approximation

Tangent plane at the point $P(x_0, y_0, z_0)$:
$$z - z_0 = f_x(x_0, y_0)(x - x_0) + f_y(x_0, y_0)(y - y_0)$$

Linearization: when $(x, y)$ is close to $(x_0, y_0)$, approximate $f(x, y)$ by the height of the tangent plane $L(x, y)$.

### The Multivariable Chain Rule

If $z = f(x, y)$ with $x=x(t), y=y(t)$, then: $\frac{dz}{dt} = \frac{\partial f}{\partial x} \frac{dx}{dt} + \frac{\partial f}{\partial y} \frac{dy}{dt}$

## Gradients and Extrema

### Gradient

Definition: $\nabla f(x, y) = \langle f_x, f_y \rangle = f_x \mathbf{i} + f_y \mathbf{j}$.

Directional derivative: the rate of change along a unit vector $\vec{u} = \langle a, b \rangle$ is $D_{\vec{u}}f = \nabla f \cdot \vec{u}$.

Geometric meaning: the gradient points in the direction of fastest increase. The gradient vector is always perpendicular to the level curves.

### Extrema and the Second Derivative Test

Critical points: points where $f_x = 0$ and $f_y = 0$.

Hessian discriminant ($D$): $D = f_{xx}f_{yy} - (f_{xy})^2$

- If $D > 0$ and $f_{xx} > 0 \implies$ local minimum.
- If $D > 0$ and $f_{xx} < 0 \implies$ local maximum.
- If $D < 0 \implies$ saddle point.
- If $D = 0 \implies$ the test is inconclusive.

### Lagrange Multipliers

Use case: minimize or maximize $f(x, y)$ subject to the constraint $g(x, y) = k$.

Key idea: at an extremum the level curves of the two functions are tangent, so their gradients are parallel:

$$
\nabla f = \lambda \nabla g
$$

## Multiple Integrals

### Double Integrals

#### Fubini's Theorem

A double integral can be computed as an iterated integral.

Region types:

- Type I (bottom to top): integrate with respect to $y$ first, entering through the curve $y=g_1(x)$ and leaving through $y=g_2(x)$.
- Type II (left to right): integrate with respect to $x$ first. Polar coordinates: suited to circular regions. $x = r\cos\theta, y = r\sin\theta, x^2 + y^2 = r^2$.

Area element $dA = r dr d\theta$.

### Triple Integrals

Setting the bounds: fix $(x, y)$ and find the surfaces where $z$ enters and leaves the region.

#### Cylindrical Coordinates

$(r, \theta, z)$, volume element $dV = r dz dr d\theta$.

#### Spherical Coordinates

$(\rho, \phi, \theta)$, where $\rho$ is the distance, $\phi$ is the polar (zenith) angle ($0 \le \phi \le \pi$), and $\theta$ is the azimuthal angle.

Transformation: $x = \rho\sin\phi\cos\theta, y = \rho\sin\phi\sin\theta, z = \rho\cos\phi$.

Volume element $dV = \rho^2 \sin\phi d\rho d\phi d\theta$.

### The Jacobian

Corrects the differential element under a change of coordinates: $dx dy = |J| du dv$.

$$
J = \frac{\partial(x,y)}{\partial(u,v)} = \det \begin{vmatrix} x_u & x_v \\ y_u & y_v \end{vmatrix}
$$

## Vector Analysis

### Line Integrals

Computation: parameterize the curve $C = \vec{r}(t)$, then $\int_C \vec{F} \cdot d\vec{r} = \int_a^b \vec{F}(\vec{r}(t)) \cdot \vec{r}'(t) dt$.

#### Fundamental Theorem for Line Integrals

If $\vec{F} = \nabla f$ (a conservative field), then $\int_C \vec{F} \cdot d\vec{r} = f(\text{end}) - f(\text{start})$.

#### Test for Conservative Fields

For $\vec{F} = \langle P, Q \rangle$, if $\frac{\partial P}{\partial y} = \frac{\partial Q}{\partial x}$, the field is conservative.

### Green's Theorem

Converts a line integral around a closed curve into a double integral over the enclosed region:

$$
\oint_C P dx + Q dy = \iint_D \left( \frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y} \right) dA
$$

### Curl and Divergence

- Curl: $\nabla \times \vec{F}$, describes the local rotational tendency of a fluid.
- Divergence: $\text{div} \vec{F} = \nabla \cdot \vec{F} = \frac{\partial P}{\partial x} + \frac{\partial Q}{\partial y} + \frac{\partial R}{\partial z}$. $> 0$ means expansion (a source); $< 0$ means compression (a sink).

### The Three Major Theorems

#### Flux Formula

$$
\iint_S \vec{F} \cdot d\vec{S} = \iint_D \vec{F}(\vec{r}(x, y)) \cdot (\vec{r}_x \times \vec{r}_y) dA
$$

#### Stokes' Theorem

Relates the integral around a closed space curve to the flux of the curl through a surface.

$$
\oint_C \vec{F} \cdot d\vec{r} = \iint_S (\nabla \times \vec{F}) \cdot d\vec{S}
$$

#### Divergence Theorem (Gauss's Theorem)

Relates the flux through a closed surface to the volume integral of the divergence:

$$
\iint_S \vec{F} \cdot d\vec{S} = \iiint_E (\nabla \cdot \vec{F}) dV
$$
