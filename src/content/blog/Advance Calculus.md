---
title: 'Calculus III'
description: 'Calculus III的内容笔记'
pubDate: '2026-02-08'
tags: ['Math', 'Calculus']
category: 'Study'
---

## 基础知识

### 三维向量

$v=<x,y,z>$

模长$|v|=\sqrt{x^2+y^2+z^2}$

### 三维向量的点积

结果为标量

给定$v_1=<x_1,y_1,z_1>$, $v_2=<x_2,y_2,z_2>$

其点积$v_1\cdot v_2=x_1x_2+y_1y_2+z_1z_2=|v_1||v_2|cos\theta$

若$v_1 \cdot v_2=0$, 则$v_1 \perp v_2$

$cos\theta=\frac{a\cdot b}{|a||b|}$

### 三维向量的叉积

结果为向量

给定$v_1=<x_1,y_1,z_1>$, $v_2=<x_2,y_2,z_2>$

其叉积$v_1 \times v_2=\det \left | \begin{matrix}
    i & j & k \\
    x_1 & y_1 & z_1 \\
    x_2 & y_2 & z_2 \\
\end{matrix} \right |=(y_1z_2-y_2z_1)i-(x_1z_2-x_2z_1)j+(x_1y_2-x_2y_1)k$

$|v_1 \times v_2|=|v_1||v_2|sin\theta$

方向用右手定则确定：$v_1$卷向$v_2$，拇指方向为叉积方向。

用于产生同时垂直于$v_1,v_2$的向量，$|a \times b| =$以a,b为邻边的平行四边形面积。

### 空间直线与面

**空间直线**——一点一向量

给定空间中一点和一向量$r_0=(x_0,y_0,z_0),\vec v_0 = <a,b,c>$

则直线$r = r_0+\lambda \vec v_0, \lambda \in \R$

或整理成参数方程形式：

$\begin{array}{l}
    x&= x_0+\lambda a \\
    y&=y_0+\lambda b \\
    z&=z_0+\lambda c \\
\end{array}$

**空间面**——一点一法向量
给定法向量$n=<a,b,c>$与平面上一点$P_0(x_0,y_0,z_0)$

则平面上的点$P$满足$n\cdot \vec {PP_0}=0$

展开：$a(x-x_0)+b(y-y_0)+c(z-z_0)=0$

即标准形式: $ax+by+cz=d,d=ax_0+by_0+cz_0$

### 二次曲面

#### 球/椭球

$x^2+y^2+z^2=R^2$（球）

$\frac{x^2}{a^2}+\frac{y^2}{b^2}+\frac{z^2}{c^2}=1$（椭球）

#### 柱

$x^2+y^2=C$

#### 抛物面

$z=x^2+y^2$（开口向上）

$z=C-x^2-y^2$（开口向下）

#### 圆锥面

$z=\sqrt{x^2+y^2}$或$z^2=x^2+y^2$

## 向量函数 (Vector Functions)

定义：$\vec{r}(t) = \langle X(t), Y(t), Z(t) \rangle$。

几何意义：轨迹随 $t$ 变化会在空间中画出曲线，即空间曲线。

示例：螺旋线 $\vec{r}(t) = \langle \cos t, \sin t, t \rangle$。

### 导数与物理意义

求导：$\vec{r}'(t) = \langle X'(t), Y'(t), Z'(t) \rangle$。

切向量：$\vec{r}'(t)$ 被称为切向量。

速度与速率：若 $\vec{r}(t)$ 表示位置，则 $\vec{r}'(t)$ 为速度向量。其方向为曲线切线方向，模长 $|\vec{r}'(t)|$ 为速率。

### 弧长与曲率

#### 弧长 (Arc Length)

从 $t=a$ 到 $t=b$ 的长度为 $L = \int_{a}^{b} |\vec{r}'(t)| dt$。

#### 曲率 ($\kappa$)

描述曲线的弯曲程度

定义：单位切向量方向随弧长的变化率。

实用计算公式：$\kappa(t) = \frac{|\vec{r}'(t) \times \vec{r}''(t)|}{|\vec{r}'(t)|^3}$

曲率半径 ($R$)：定义为 $R = \frac{1}{\kappa}$。

### TNB 框架

由单位切向量 $\vec{T}$、单位法向量 $\vec{N}$ 和副法向量 $\vec{B}$ 组成：

单位切向量：$\vec{T}(t) = \frac{\vec{r}'(t)}{|\vec{r}'(t)|}$ 。

单位法向量：$\vec{N}(t) = \frac{\vec{T}'(t)}{|\vec{T}'(t)|}$ 。副法向量：$\vec{B}(t) = \vec{T}(t) \times \vec{N}(t)$。

## 多元函数基础

二元函数 $z = f(x, y)$

定义域：通常是 $xy$ 平面上的一个区域。

等高线 (Level Curves)：令 $f(x, y) = c$（$c$ 为常数）得到的曲线 。其物理意义类似于“把山横着切片”。

## 极限与连续

极限存在条件：从任何路径逼近 $(x_0, y_0)$ 时，极限值都必须相等 。

证明极限不存在的方法（寻找不同路径）：

- 路径 1：令 $y = b$，看 $x \to a$。
- 路径 2：令 $x = a$，看 $y \to b$。
- 路径 3：令 $y = kx$，若结果包含 $k$ 则极限不存在。
- 路径 4：令 $y = x^2$ 等（当次数不匹配时）。

连续性：若 $\lim_{(x,y) \to (a,b)} f(x, y) = f(a, b)$，则称函数在 $(a, b)$ 处连续。

## 偏导数与微分

### 偏导数 (Partial Derivatives)

法则：对 $x$ 求偏导时，将 $y$ 当作常数；反之亦然。

示例：$f(x, y) = x^3 + xy^3 - 2y^2$ $f_x = 3x^2 + y^3$$f_y = 3xy^2 - 4y$

### 切平面与线性近似切平面方程

在点 $P(x_0, y_0, z_0)$ 处 ：
$$z - z_0 = f_x(x_0, y_0)(x - x_0) + f_y(x_0, y_0)(y - y_0)$$

线性近似 (Linearization)：当 $(x, y)$ 靠近 $(x_0, y_0)$ 时，用切平面高度 $L(x, y)$ 近似 $f(x, y)$。

### 多元链式法则

若 $z = f(x, y)$ 且 $x=x(t), y=y(t)$，则：$\frac{dz}{dt} = \frac{\partial f}{\partial x} \frac{dx}{dt} + \frac{\partial f}{\partial y} \frac{dy}{dt}$

## 梯度与极值

### 梯度 (Gradient)

定义：$\nabla f(x, y) = \langle f_x, f_y \rangle = f_x \mathbf{i} + f_y \mathbf{j}$。

方向导数：沿单位向量 $\vec{u} = \langle a, b \rangle$ 的变化率为 $D_{\vec{u}}f = \nabla f \cdot \vec{u}$ 。

几何意义：梯度指向函数增长最快的方向 。梯度向量总是垂直于等高线 。

### 极值问题与二阶导数测试临界点

满足 $f_x = 0$ 且 $f_y = 0$ 的点 。

Hessian 判别式 ($D$) ：$D = f_{xx}f_{yy} - (f_{xy})^2$

- 若 $D > 0$ 且 $f_{xx} > 0 \implies$ 局部极小值。
- 若 $D > 0$ 且 $f_{xx} < 0 \implies$ 局部极大值。
- 若 $D < 0 \implies$ 鞍点 。
- 若 $D = 0 \implies$ 测试失效 。

### 拉格朗日乘数法 (Lagrange Multipliers)

场景：在约束条件 $g(x, y) = k$ 下最小/最大化 $f(x, y)$ 。

核心思想：在极值点，两者的等高线相切，即梯度共线：

$$\nabla f = \lambda \nabla g$$

## 多元积分

### 二重积分

#### 富比尼定理

可将二重积分转化为累次积分计算。

区域类型：

- Type I (上下型)：先对 $y$ 积分，穿入曲线 $y=g_1(x)$，穿出 $y=g_2(x)$。
- Type II (左右型)：先对 $x$ 积分。极坐标变换：适用于圆形区域 。$x = r\cos\theta, y = r\sin\theta, x^2 + y^2 = r^2$ 。

面积元素 $dA = r dr d\theta$ 。

### 三重积分

积分限确定：固定 $(x, y)$，看 $z$ 穿入和穿出的曲面。

#### 柱坐标

$(r, \theta, z)$，体积微元 $dV = r dz dr d\theta$。

#### 球坐标

$(\rho, \phi, \theta)$，其中 $\rho$ 为距离，$\phi$ 为天顶角 ($0 \le \phi \le \pi$)，$\theta$ 为方位角。

变换：$x = \rho\sin\phi\cos\theta, y = \rho\sin\phi\sin\theta, z = \rho\cos\phi$ 。

体积微元 $dV = \rho^2 \sin\phi d\rho d\phi d\theta$ 。

### 雅可比行列式 (Jacobian)

用于坐标变换时的微元修正：$dx dy = |J| du dv$ 。

$$J = \frac{\partial(x,y)}{\partial(u,v)} = \det \begin{vmatrix} x_u & x_v \\ y_u & y_v \end{vmatrix}$$

## 向量分析 (Vector Analysis)

### 线积分 (Line Integrals)

计算：参数化曲线 $C = \vec{r}(t)$，则 $\int_C \vec{F} \cdot d\vec{r} = \int_a^b \vec{F}(\vec{r}(t)) \cdot \vec{r}'(t) dt$ 。

#### 线积分基本定理

若 $\vec{F} = \nabla f$（保守场），则 $\int_C \vec{F} \cdot d\vec{r} = f(\text{终点}) - f(\text{起点})$。

#### 保守场测试

对于 $\vec{F} = \langle P, Q \rangle$，若 $\frac{\partial P}{\partial y} = \frac{\partial Q}{\partial x}$，则为保守场 。

### 格林公式 (Green's Theorem)

将闭合曲线的线积分转化为区域内的二重积分 ：

$$\oint_C P dx + Q dy = \iint_D \left( \frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y} \right) dA$$

### 旋度与散度

- 旋度 (Curl)：$\nabla \times \vec{F}$，描述流体的微观旋转趋势。
- 散度 (Divergence)：$\text{div} \vec{F} = \nabla \cdot \vec{F} = \frac{\partial P}{\partial x} + \frac{\partial Q}{\partial y} + \frac{\partial R}{\partial z}$。$> 0$ 表示膨胀（源），$< 0$ 表示压缩（汇） 。

### 三大定理

#### 通量公式

$$\iint_S \vec{F} \cdot d\vec{S} = \iint_D \vec{F}(\vec{r}(x, y)) \cdot (\vec{r}_x \times \vec{r}_y) dA$$

#### 斯托克斯定理 (Stokes' Theorem)

空间闭曲线积分与曲面旋度通量的转换。

$$\oint_C \vec{F} \cdot d\vec{r} = \iint_S (\nabla \times \vec{F}) \cdot d\vec{S}$$

#### 高斯散度定理 (Divergence Theorem)

封闭曲面通量与体积散度积分的转换 ：

$$\iint_S \vec{F} \cdot d\vec{S} = \iiint_E (\nabla \cdot \vec{F}) dV$$
