  (func (;43789;) (type 1) (param i32 i32)
    (local i64 i32)
    local.get 0
    i32.const 1
    i32.store8 offset=24
    i32.const 4377527
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3364792
      call 2180
      i32.const 4377527
      i32.const 1
      i32.store8
    end
    i32.const 3364792
    i32.load
    local.tee 1
    i32.load offset=92
    local.tee 3
    i64.load align=4
    local.set 2
    local.get 0
    local.get 3
    i32.load offset=8
    i32.store offset=36
    local.get 0
    local.get 2
    i64.store offset=28 align=4
    i32.const 4377531
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3364792
      call 2180
      i32.const 4377531
      i32.const 1
      i32.store8
      i32.const 3364792
      i32.load
      local.set 1
    end
    local.get 1
    i32.load offset=92
    local.tee 3
    i64.load offset=12 align=4
    local.set 2
    local.get 0
    local.get 3
    i32.load offset=20
    i32.store offset=52
    local.get 0
    local.get 2
    i64.store offset=44 align=4
    local.get 0
    i32.const 1063675494
    i32.store offset=56
    local.get 1
    i32.load offset=92
    local.tee 1
    i64.load offset=12 align=4
    local.set 2
    local.get 0
    local.get 1
    i32.load offset=20
    i32.store offset=68
    local.get 0
    local.get 2
    i64.store offset=60 align=4
    local.get 0
    i32.const 1036831949
    i32.store offset=76
    local.get 0
    i32.const 0
    call 48709)
