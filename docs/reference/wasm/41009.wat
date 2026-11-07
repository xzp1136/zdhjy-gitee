  (func (;41009;) (type 70) (param i32 i32 f32 f32 i32)
    global.get 0
    i32.const 80
    i32.sub
    local.tee 0
    global.set 0
    i32.const 4365111
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 4365111
      i32.const 1
      i32.store8
    end
    i32.const 3360788
    i32.load
    local.tee 4
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 4
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 1
      i32.const 0
      call 48736
      i32.const 1
      i32.const 0
      call 48833
      local.get 1
      i32.const 1
      i32.const 0
      call 48707
      local.get 1
      local.get 2
      i32.const 0
      call 20969
      local.get 0
      local.get 1
      i32.const 0
      i32.const 0
      call 20939
      local.get 0
      local.get 0
      i32.load offset=32
      i32.store offset=72
      local.get 0
      i32.const -64
      i32.sub
      local.get 0
      i64.load offset=24
      i64.store
      local.get 0
      local.get 0
      i64.load offset=16
      i64.store offset=56
      local.get 0
      local.get 0
      i64.load offset=8
      i64.store offset=48
      local.get 0
      local.get 0
      i64.load
      i64.store offset=40
      local.get 0
      i32.const 40
      i32.add
      i32.load offset=8
      i32.eqz
      br_if 0 (;@1;)
      local.get 1
      local.get 0
      i32.const 40
      i32.add
      i32.load offset=8
      i32.const 0
      local.get 3
      i32.const 0
      call 20971
    end
    local.get 0
    i32.const 80
    i32.add
    global.set 0)
