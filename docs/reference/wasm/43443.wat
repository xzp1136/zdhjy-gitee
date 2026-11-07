  (func (;43443;) (type 1) (param i32 i32)
    i32.const 4366777
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3435584
      call 2180
      i32.const 4366777
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load8_u offset=104
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load8_u offset=130
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=112
      local.get 0
      i32.load offset=92
      i32.const 1
      i32.add
      i32.gt_s
      br_if 0 (;@1;)
      local.get 0
      i32.const 1
      i32.store8 offset=130
      i32.const 3356428
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 3435584
      i32.load
      i32.const 0
      call 55817
      i32.const 4366778
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3369212
        call 2180
        i32.const 4366778
        i32.const 1
        i32.store8
      end
      i32.const 3369212
      i32.load
      call 1900
      local.tee 1
      local.get 0
      i32.store offset=16
      local.get 1
      i32.const 0
      i32.store offset=8
      local.get 0
      local.get 1
      i32.const 0
      call 48887
      drop
    end)
