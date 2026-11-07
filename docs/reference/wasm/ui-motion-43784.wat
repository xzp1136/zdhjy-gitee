  (func (;43784;) (type 2) (param i32 i32 i32)
    (local f32 f32 f32 f32 i64 i32 i32)
    global.get 0
    i32.const 32
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366988
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3420028
      call 2180
      i32.const 3420152
      call 2180
      i32.const 4366988
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.const 0
    i32.store offset=80
    local.get 0
    i32.const 1
    i32.store8 offset=84
    local.get 0
    f32.load offset=48
    local.set 4
    local.get 0
    f32.load offset=52
    local.set 5
    local.get 0
    f32.load offset=56
    local.set 3
    local.get 0
    f32.load offset=44
    local.set 6
    local.get 0
    i32.const 0
    call 48735
    local.set 8
    local.get 2
    i32.const 24
    i32.add
    local.tee 9
    local.get 5
    local.get 3
    f32.mul
    f32.store
    local.get 2
    local.get 9
    i32.load
    i32.store offset=8
    local.get 2
    local.get 4
    local.get 3
    f32.mul
    f32.store offset=20
    local.get 2
    local.get 6
    local.get 3
    f32.mul
    f32.store offset=16
    local.get 2
    local.get 2
    i64.load offset=16
    i64.store
    local.get 8
    local.get 2
    f32.const 0x1.99999ap-4 (;=0.1;)
    i32.const 0
    call 7781
    i32.const 7
    i32.const 3420152
    i32.load
    call 14789
    drop
    local.get 1
    i64.load offset=200 align=4
    local.set 7
    local.get 0
    i32.const 0
    i32.store offset=36
    local.get 0
    local.get 7
    i64.store32 offset=28
    local.get 0
    local.get 7
    i64.const 32
    i64.shr_u
    i64.store32 offset=32
    local.get 0
    i32.load offset=92
    local.tee 0
    if  ;; label = @1
      local.get 0
      i32.const 3420028
      i32.load
      call 14766
      drop
    end
    local.get 2
    i32.const 32
    i32.add
    global.set 0)
