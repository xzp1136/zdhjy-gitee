  (func (;44440;) (type 6) (param i32 i32 i32 i32)
    global.get 0
    i32.const 48
    i32.sub
    local.tee 0
    global.set 0
    i32.const 4367450
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 3420152
      call 2180
      i32.const 4367450
      i32.const 1
      i32.store8
    end
    i32.const 3360788
    i32.load
    local.tee 3
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 3
      call 60460
    end
    local.get 1
    i32.const 0
    i32.const 0
    call 48872
    i32.eqz
    if  ;; label = @1
      local.get 1
      i32.const 0
      call 48735
      local.tee 1
      i32.const 0
      i32.const 0
      call 7821
      drop
      local.get 0
      i32.const 0
      i32.store offset=40
      local.get 0
      i32.const 0
      i32.store offset=24
      local.get 0
      i64.const 0
      i64.store offset=32
      local.get 0
      i64.const 0
      i64.store offset=16
      local.get 1
      local.get 0
      i32.const 16
      i32.add
      f32.const 0x1.333334p-1 (;=0.6;)
      i32.const 0
      call 7781
      i32.const 7
      i32.const 3420152
      i32.load
      call 14789
      drop
      local.get 0
      local.get 2
      i32.load offset=8
      i32.store offset=8
      local.get 0
      local.get 2
      i64.load align=4
      i64.store
      local.get 1
      local.get 0
      f32.const 0x1p-1 (;=0.5;)
      i32.const 0
      i32.const 0
      call 7767
      i32.const 7
      i32.const 3420152
      i32.load
      call 14789
      drop
    end
    local.get 0
    i32.const 48
    i32.add
    global.set 0)
